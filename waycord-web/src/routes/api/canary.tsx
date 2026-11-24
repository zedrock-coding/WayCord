import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader, getRequestIP } from '@tanstack/react-start/server'

export const reportCanaryTripwire = createServerFn({ method: 'POST' })
  .validator((data: { endpoint?: string; canaryToken?: string; metadata?: Record<string, any> }) => data)
  .handler(async ({ data }) => {
    const { triggerHoneypotTripwire } = await import('../../lib/server/honeypot')
    let ip = getRequestIP() || getRequestHeader('x-forwarded-for') || 'unknown'
    let userAgent = getRequestHeader('user-agent') || 'unknown'

    const incidentId = await triggerHoneypotTripwire({
      tripwireType: data.canaryToken ? 'canary_token' : 'canary_endpoint',
      endpoint: data.endpoint || '/api/canary',
      tokenSignature: data.canaryToken,
      ipAddress: Array.isArray(ip) ? ip[0] : ip,
      userAgent: Array.isArray(userAgent) ? userAgent[0] : userAgent,
      payload: data.metadata || {},
    })

    return {
      status: 'trapped',
      id: incidentId,
    }
  })

export const Route = createFileRoute('/api/canary')({
  component: CanaryTripwireComponent,
})

function CanaryTripwireComponent() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md text-center">
        <h1 className="text-red-400 font-mono font-bold text-lg mb-2">Access Denied</h1>
        <p className="text-slate-400 text-sm">Security telemetry active. Tripwire registered.</p>
      </div>
    </div>
  )
}
