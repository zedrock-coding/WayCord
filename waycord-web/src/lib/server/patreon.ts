import crypto from 'node:crypto'
import { createServerServiceClient } from './supabase'

export function verifyPatreonSignature(rawBody: string, signature: string): boolean {
  try {
    const secret = process.env.PATREON_WEBHOOK_SECRET
    if (!secret || !signature) {
      return false
    }
    const hmac = crypto.createHmac('md5', secret).update(rawBody).digest('hex')
    const sigBuf = Buffer.from(signature)
    const hmacBuf = Buffer.from(hmac)
    if (sigBuf.length !== hmacBuf.length) {
      return false
    }
    return crypto.timingSafeEqual(sigBuf, hmacBuf)
  } catch {
    return false
  }
}

export async function processPatreonWebhookEvent(event: string, payload: any) {
  const supabaseService = createServerServiceClient()
  const patreonUserId = payload.data?.relationships?.patron?.data?.id
  const eventId = payload.data?.id || `patreon_${Date.now()}`

  await supabaseService.from('billing_events_log').insert({
    provider: 'patreon',
    event_id: eventId,
    event_type: event,
    payload,
  })

  if (event === 'members:pledge:delete') {
    await supabaseService
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('provider_customer_id', patreonUserId)
  } else if (event === 'members:pledge:create' || event === 'members:pledge:update') {
    const now = new Date()
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    await supabaseService
      .from('user_subscriptions')
      .update({
        status: 'active',
        current_period_end: periodEnd.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('provider_customer_id', patreonUserId)
  }
}
