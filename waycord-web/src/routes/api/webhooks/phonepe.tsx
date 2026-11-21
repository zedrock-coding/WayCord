import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

export const handlePhonePeWebhook = createServerFn({ method: 'POST' })
  .validator((data: { response?: string; xVerify?: string }) => data)
  .handler(async ({ data }) => {
    const { createServerServiceClient } = await import('../../../lib/server/supabase')
    const { verifyPhonePeChecksum } = await import('../../../lib/server/phonepe')
    const { generateOfflineLicense } = await import('../../../lib/server/offlineLicense')

    try {
      const base64Response = data.response
      const xVerify = data.xVerify || ''

      if (!base64Response) {
        return { success: false, error: 'Missing response body' }
      }

      const isValid = verifyPhonePeChecksum(base64Response, xVerify)
      if (!isValid) {
        return { success: false, error: 'Invalid X-VERIFY signature' }
      }

      const decodedStr = Buffer.from(base64Response, 'base64').toString('utf8')
      const paymentData = JSON.parse(decodedStr)

      const transactionId = paymentData.data?.merchantTransactionId
      const providerPaymentId = paymentData.data?.transactionId
      const code = paymentData.code

      const supabaseService = createServerServiceClient()

      if (code === 'PAYMENT_SUCCESS') {
        const { data: tx } = await supabaseService
          .from('payment_transactions')
          .select('*')
          .eq('merchant_transaction_id', transactionId)
          .single()

        if (tx) {
          const now = new Date()
          const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          const plan = tx.plan || 'pro'
          const signedLicense = generateOfflineLicense(tx.user_id, plan, 'phonepe', 30)

          await supabaseService
            .from('payment_transactions')
            .update({
              status: 'completed',
              provider_payment_id: providerPaymentId,
              updated_at: now.toISOString(),
            })
            .eq('id', tx.id)

          await supabaseService.from('user_subscriptions').upsert({
            user_id: tx.user_id,
            tier: plan,
            status: 'active',
            provider: 'phonepe',
            provider_subscription_id: transactionId,
            current_period_end: periodEnd.toISOString(),
            signed_entitlement_jwt: signedLicense,
            updated_at: now.toISOString(),
          })

          await supabaseService.from('billing_events_log').insert({
            provider: 'phonepe',
            event_id: transactionId,
            event_type: 'PAYMENT_SUCCESS',
            payload: paymentData,
          })
        }
      } else {
        await supabaseService
          .from('payment_transactions')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('merchant_transaction_id', transactionId)
      }

      return { success: true }
    } catch (err: any) {
      console.error('PhonePe webhook error:', err)
      return { success: false, error: err.message }
    }
  })

export const Route = createFileRoute('/api/webhooks/phonepe')({
  component: () => (
    <div className="p-8 text-xs font-mono text-slate-400">
      Waycord PhonePe Webhook Gateway Endpoint
    </div>
  ),
})
