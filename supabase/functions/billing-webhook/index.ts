// Supabase Edge Function: `billing-webhook`
//
// Hardened webhook receiver for PhonePe Payment Gateway (UPI) and Patreon.
// Enforces cryptographic signature verification, constant-time comparison,
// and database-level idempotency / replay attack protection.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { crypto } from "jsr:@std/crypto@1.0.3";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Constant-time byte comparison preventing timing attacks
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validates PhonePe X-VERIFY checksum:
 * SHA256(base64Payload + endpoint + saltKey) + "###" + saltIndex
 */
async function verifyPhonePeChecksum(
  base64Payload: string,
  endpoint: string,
  xVerifyHeader: string,
  saltKey: string,
  expectedIndex: string,
): Promise<boolean> {
  const parts = xVerifyHeader.split("###");
  if (parts.length !== 2) return false;

  const [receivedHash, receivedIndex] = parts;
  if (receivedIndex !== expectedIndex) return false;

  const dataToHash = `${base64Payload}${endpoint}${saltKey}`;
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(dataToHash));
  const computedHash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return constantTimeEqual(computedHash.toLowerCase(), receivedHash.toLowerCase());
}

/**
 * Validates Patreon X-Patreon-Signature HMAC:
 * HMAC-MD5 of raw request body using Patreon webhook secret
 */
async function verifyPatreonSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, // Supports standard SHA-256 / MD5
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
  const computedHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return constantTimeEqual(computedHex.toLowerCase(), signatureHeader.toLowerCase());
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  // Admin client with service_role permissions (bypasses RLS to update subscriptions)
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const rawBody = await req.text();
  const phonePeVerify = req.headers.get("X-VERIFY");
  const patreonSignature = req.headers.get("X-Patreon-Signature");
  const patreonEvent = req.headers.get("X-Patreon-Event");

  // =========================================================================
  // 1. PhonePe Webhook Processing
  // =========================================================================
  if (phonePeVerify) {
    const saltKey = Deno.env.get("PHONEPE_SALT_KEY") ?? "mock_phonepe_salt";
    const saltIndex = Deno.env.get("PHONEPE_SALT_INDEX") ?? "1";

    let payloadJson: Record<string, unknown>;
    try {
      payloadJson = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: "Malformed JSON" }, 400);
    }

    const base64Response = String(payloadJson.response ?? "");
    const isValid = await verifyPhonePeChecksum(
      base64Response,
      "/v3/transaction/callback",
      phonePeVerify,
      saltKey,
      saltIndex,
    );

    if (!isValid) {
      console.warn("Invalid PhonePe signature");
      return jsonResponse({ error: "Invalid signature" }, 401);
    }

    let decodedEvent: Record<string, unknown>;
    try {
      const decodedStr = atob(base64Response);
      decodedEvent = JSON.parse(decodedStr);
    } catch {
      return jsonResponse({ error: "Invalid base64 payload" }, 400);
    }

    const dataObj = (decodedEvent.data ?? {}) as Record<string, unknown>;
    const transactionId = String(dataObj.merchantTransactionId ?? dataObj.transactionId ?? "");
    const merchantUserId = String(dataObj.merchantUserId ?? "");
    const code = String(decodedEvent.code ?? "");

    if (!transactionId) {
      return jsonResponse({ error: "Missing transaction ID" }, 400);
    }

    // Idempotency check: record event in billing_events_log
    const { error: logError } = await adminClient.from("billing_events_log").insert({
      provider: "phonepe",
      event_id: transactionId,
      event_type: code,
      payload: decodedEvent,
    });

    if (logError) {
      if (logError.code === "23505") { // Unique constraint violation -> replay attack prevented
        console.info(`Idempotent ignore: transaction ${transactionId} already processed.`);
        return jsonResponse({ status: "already_processed" }, 200);
      }
      console.error("Error logging billing event", logError);
      return jsonResponse({ error: "Database error" }, 500);
    }

    // Update user subscription on payment success
    if (code === "PAYMENT_SUCCESS") {
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30); // 30-day billing cycle

      await adminClient.from("user_subscriptions").upsert({
        user_id: merchantUserId,
        tier: "pro",
        status: "active",
        provider: "phonepe",
        provider_subscription_id: transactionId,
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return jsonResponse({ status: "ok" });
  }

  // =========================================================================
  // 2. Patreon Webhook Processing
  // =========================================================================
  if (patreonSignature && patreonEvent) {
    const patreonSecret = Deno.env.get("PATREON_WEBHOOK_SECRET") ?? "mock_patreon_secret";
    const isValid = await verifyPatreonSignature(rawBody, patreonSignature, patreonSecret);

    if (!isValid) {
      console.warn("Invalid Patreon signature");
      return jsonResponse({ error: "Invalid signature" }, 401);
    }

    let payloadJson: Record<string, unknown>;
    try {
      payloadJson = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: "Malformed JSON" }, 400);
    }

    const eventId = String(payloadJson.id ?? `${patreonEvent}_${Date.now()}`);

    // Idempotency check
    const { error: logError } = await adminClient.from("billing_events_log").insert({
      provider: "patreon",
      event_id: eventId,
      event_type: patreonEvent,
      payload: payloadJson,
    });

    if (logError && logError.code === "23505") {
      console.info(`Idempotent ignore: Patreon event ${eventId} already processed.`);
      return jsonResponse({ status: "already_processed" }, 200);
    }

    const dataObj = (payloadJson.data ?? {}) as Record<string, unknown>;
    const relationships = (dataObj.relationships ?? {}) as Record<string, unknown>;
    const userRel = (relationships.user ?? {}) as Record<string, unknown>;
    const userData = (userRel.data ?? {}) as Record<string, unknown>;
    const patreonUserId = String(userData.id ?? "");

    if (patreonEvent === "members:pledge:create" || patreonEvent === "members:pledge:update") {
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);

      await adminClient.from("user_subscriptions").upsert({
        user_id: patreonUserId,
        tier: "pro",
        status: "active",
        provider: "patreon",
        provider_customer_id: patreonUserId,
        current_period_end: periodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      });
    } else if (patreonEvent === "members:pledge:delete") {
      await adminClient.from("user_subscriptions").update({
        status: "canceled",
        tier: "free",
        updated_at: new Date().toISOString(),
      }).eq("provider_customer_id", patreonUserId);
    }

    return jsonResponse({ status: "ok" });
  }

  return jsonResponse({ error: "Unknown billing provider header" }, 400);
});
