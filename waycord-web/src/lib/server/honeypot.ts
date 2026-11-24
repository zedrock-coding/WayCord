export interface HoneypotReportParams {
  tripwireType: 'canary_endpoint' | 'canary_token' | 'decoy_credential'
  endpoint: string
  tokenSignature?: string
  ipAddress?: string
  userAgent?: string
  headers?: Record<string, string>
  payload?: Record<string, any>
}

export async function triggerHoneypotTripwire(params: HoneypotReportParams) {
  try {
    const { createServerServiceClient } = await import('./supabase')
    const supabase = createServerServiceClient()

    // 1. Insert incident into security_tripwires
    const { data, error } = await supabase
      .from('security_tripwires')
      .insert({
        tripwire_type: params.tripwireType,
        endpoint: params.endpoint,
        token_signature: params.tokenSignature || null,
        ip_address: params.ipAddress || 'unknown',
        user_agent: params.userAgent || 'unknown',
        headers: params.headers || {},
        payload: params.payload || {},
        threat_level: 'HIGH',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to log security tripwire:', error)
      return null
    }

    const incidentId = data?.id

    // 2. Dispatch to AI threat triage function if SUPABASE_URL exists
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eknzdxexfcfdmqvbyvxt.supabase.co'
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && serviceRoleKey && incidentId) {
      // Fire-and-forget background call to security-triage function
      fetch(`${supabaseUrl}/functions/v1/security-triage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          incident_id: incidentId,
          tripwire_type: params.tripwireType,
          endpoint: params.endpoint,
          token_signature: params.tokenSignature,
          ip_address: params.ipAddress,
          user_agent: params.userAgent,
          headers: params.headers,
          request_payload: params.payload,
        }),
      }).catch((err) => console.error('Failed to trigger AI triage:', err))
    }

    return incidentId
  } catch (err) {
    console.error('Honeypot tripwire error:', err)
    return null
  }
}
