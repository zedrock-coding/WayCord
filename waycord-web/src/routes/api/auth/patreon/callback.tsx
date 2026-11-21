import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

export const handlePatreonCallback = createServerFn({ method: 'GET' })
  .validator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const { createServerSupabaseClient, createServerServiceClient } = await import(
      '../../../../lib/server/supabase'
    )
    const { generateOfflineLicense } = await import(
      '../../../../lib/server/offlineLicense'
    )

    const code = data.code
    if (!code) {
      return { status: 'error', message: 'Missing OAuth authorization code' }
    }

    const supabaseServer = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabaseServer.auth.getUser()

    if (!user) {
      return { status: 'error', message: 'User must be authenticated before linking Patreon' }
    }

    const clientId = process.env.PATREON_CLIENT_ID || 'mock_patreon_client'
    const clientSecret = process.env.PATREON_CLIENT_SECRET || 'mock_patreon_secret'
    const siteUrl = process.env.VITE_SITE_URL || 'https://waycord.vercel.app'
    const redirectUri = `${siteUrl}/api/auth/patreon/callback`

    try {
      const tokenRes = await fetch('https://www.patreon.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      })

      const tokenData = await tokenRes.json()

      let patreonUserId = user.id
      const pledgeTier: 'pro' | 'team' = 'pro'

      if (tokenData.access_token) {
        const userRes = await fetch(
          'https://www.patreon.com/api/oauth2/v2/identity?include=memberships',
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          },
        )
        const userData = await userRes.json()
        if (userData?.data?.id) {
          patreonUserId = userData.data.id
        }
      }

      const supabaseService = createServerServiceClient()
      const now = new Date()
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const signedLicense = generateOfflineLicense(user.id, pledgeTier, 'patreon', 30)

      await supabaseService.from('user_subscriptions').upsert({
        user_id: user.id,
        tier: pledgeTier,
        status: 'active',
        provider: 'patreon',
        provider_customer_id: patreonUserId,
        current_period_end: periodEnd.toISOString(),
        signed_entitlement_jwt: signedLicense,
        updated_at: now.toISOString(),
      })

      return { status: 'success', redirect: '/billing?success=patreon' }
    } catch (err: any) {
      console.error('Patreon token exchange error:', err)
      return { status: 'error', message: err.message || 'Patreon token exchange failed' }
    }
  })

export const Route = createFileRoute('/api/auth/patreon/callback')({
  loader: async ({ location }) => {
    const search = new URLSearchParams(location.search)
    const code = search.get('code') || ''
    return await handlePatreonCallback({ data: { code } })
  },
  component: PatreonCallbackComponent,
})

function PatreonCallbackComponent() {
  const data = Route.useLoaderData()

  if (data?.redirect && typeof window !== 'undefined') {
    window.location.href = data.redirect
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center max-w-md">
        <h2 className="text-xl font-bold text-white mb-2">Connecting Patreon...</h2>
        <p className="text-xs text-slate-400">
          {data?.message || 'Finalizing OAuth pledge handshake and updating entitlements.'}
        </p>
      </div>
    </div>
  )
}
