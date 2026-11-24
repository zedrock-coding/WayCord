import { createClient } from "jsr:@supabase/supabase-js@2";

const MODEL = "gemini-3.5-flash-lite";

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "*";
  return {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": origin,
  };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  const json = (data: Record<string, unknown>, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Server misconfigured." }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  let payload: Record<string, any>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const { incident_id, tripwire_type, endpoint, token_signature, ip_address, user_agent, headers, request_payload } = payload;

  let threatLevel = "MEDIUM";
  let aiSummary = "Canary tripwire triggered. Potential probing or reconnaissance.";

  if (geminiApiKey) {
    try {
      const prompt = `Analyze this security canary tripwire hit:
Tripwire Type: ${tripwire_type || "unknown"}
Target Endpoint: ${endpoint || "unknown"}
Client IP: ${ip_address || "unknown"}
User-Agent: ${user_agent || "unknown"}
Token Signature: ${token_signature || "none"}
Request Headers: ${JSON.stringify(headers || {})}
Request Payload: ${JSON.stringify(request_payload || {})}

Classify threat level as LOW, MEDIUM, HIGH, or CRITICAL.
Provide a concise 1-2 sentence threat assessment and recommended action.
Return JSON format: {"threat_level": "LOW|MEDIUM|HIGH|CRITICAL", "analysis": "assessment"}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiApiKey,
          },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          if (parsed.threat_level) threatLevel = parsed.threat_level.toUpperCase();
          if (parsed.analysis) aiSummary = parsed.analysis;
        }
      }
    } catch (e) {
      console.error("AI security analysis failed:", e);
    }
  }

  // Update tripwire incident record in database
  if (incident_id) {
    await supabase
      .from("security_tripwires")
      .update({
        threat_level: threatLevel,
        ai_analysis: aiSummary,
      })
      .eq("id", incident_id);
  }

  return json({
    success: true,
    incident_id,
    threat_level: threatLevel,
    analysis: aiSummary,
  });
});
