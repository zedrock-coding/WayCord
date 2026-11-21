import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

export const handlePatreonWebhook = createServerFn({ method: 'POST' })
  .validator((data: { rawBody: string; signature: string; event: string }) => data)
  .handler(async ({ data }) => {
    const { verifyPatreonSignature, processPatreonWebhookEvent } = await import(
      '../../../lib/server/patreon'
    )

    try {
      const isValid = verifyPatreonSignature(data.rawBody, data.signature)
      if (!isValid && process.env.NODE_ENV === 'production') {
        return { success: false, error: 'Invalid Patreon webhook signature' }
      }

      const payload = JSON.parse(data.rawBody)
      await processPatreonWebhookEvent(data.event, payload)

      return { success: true }
    } catch (err: any) {
      console.error('Patreon webhook processing error:', err)
      return { success: false, error: err.message }
    }
  })

export const Route = createFileRoute('/api/webhooks/patreon')({
  component: () => (
    <div className="p-8 text-xs font-mono text-slate-400">
      Waycord Patreon Webhook Gateway Endpoint
    </div>
  ),
})
