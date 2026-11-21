import crypto from 'node:crypto'

export interface EntitlementPayload {
  userId: string
  tier: 'pro' | 'team'
  provider: 'phonepe' | 'patreon' | 'dev_override'
  issuedAt: string
  expiresAt: string
  deviceLimit: number
  voiceQuota: number
}

function getSecretKey(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.PHONEPE_SALT_KEY
  if (!secret) {
    throw new Error('Offline license secret key is required')
  }
  return secret
}

export function generateOfflineLicense(
  userId: string,
  tier: 'pro' | 'team',
  provider: 'phonepe' | 'patreon' | 'dev_override',
  durationDays = 30,
): string {
  const secretKey = getSecretKey()
  const now = new Date()
  const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)

  const payload: EntitlementPayload = {
    userId,
    tier,
    provider,
    issuedAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
    deviceLimit: -1,
    voiceQuota: -1,
  }

  const payloadStr = JSON.stringify(payload)
  const encodedPayload = Buffer.from(payloadStr, 'utf8').toString('base64url')

  const hmac = crypto.createHmac('sha256', secretKey)
  hmac.update(encodedPayload)
  const signature = hmac.digest('base64url')

  return `${encodedPayload}.${signature}`
}

export function verifyOfflineLicense(token: string): EntitlementPayload | null {
  try {
    const [encodedPayload, signature] = token.split('.')
    if (!encodedPayload || !signature) return null

    const secretKey = getSecretKey()
    const hmac = crypto.createHmac('sha256', secretKey)
    hmac.update(encodedPayload)
    const expectedSig = hmac.digest('base64url')

    const sigBuf = Buffer.from(signature)
    const expectedSigBuf = Buffer.from(expectedSig)

    if (
      sigBuf.length !== expectedSigBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedSigBuf)
    ) {
      return null
    }

    const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8')
    const payload: EntitlementPayload = JSON.parse(payloadJson)

    if (new Date(payload.expiresAt).getTime() < Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
