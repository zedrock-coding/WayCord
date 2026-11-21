import crypto from 'node:crypto'

export interface PhonePePaymentRequest {
  merchantTransactionId: string
  merchantUserId: string
  amountInPaise: number
  redirectUrl: string
  callbackUrl: string
}

export function getPhonePeConfig() {
  return {
    merchantId: process.env.PHONEPE_MERCHANT_ID || 'MOCK_MERCHANT',
    saltKey: process.env.PHONEPE_SALT_KEY || 'mock_salt_key_12345',
    saltIndex: process.env.PHONEPE_SALT_INDEX || '1',
    env: process.env.PHONEPE_ENV || 'SANDBOX',
    apiBase:
      process.env.PHONEPE_ENV === 'PRODUCTION'
        ? 'https://api.phonepe.com/apis/hermes'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  }
}

export function createPhonePePayload(req: PhonePePaymentRequest) {
  const { merchantId, saltKey, saltIndex } = getPhonePeConfig()

  const payload = {
    merchantId,
    merchantTransactionId: req.merchantTransactionId,
    merchantUserId: req.merchantUserId,
    amount: req.amountInPaise,
    redirectUrl: req.redirectUrl,
    redirectMode: 'REDIRECT',
    callbackUrl: req.callbackUrl,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  }

  const base64Payload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64')
  const stringToSign = `${base64Payload}/pg/v1/pay${saltKey}`
  const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex')
  const xVerify = `${sha256}###${saltIndex}`

  return {
    base64Payload,
    xVerify,
    payload,
  }
}

export function verifyPhonePeChecksum(base64Payload: string, xVerifyHeader: string): boolean {
  try {
    const { saltKey, saltIndex } = getPhonePeConfig()
    const stringToSign = `${base64Payload}${saltKey}`
    const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex')
    const expectedChecksum = `${sha256}###${saltIndex}`
    return xVerifyHeader === expectedChecksum
  } catch {
    return false
  }
}
