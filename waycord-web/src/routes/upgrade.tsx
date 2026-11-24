import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { supabase } from '../lib/supabase/client'

const upgradeSearchSchema = z.object({
  plan: z.enum(['pro', 'team']).optional().catch('pro'),
})

export const fetchCurrentSubscription = createServerFn({ method: 'GET' }).handler(async () => {
  const { createServerSupabaseClient } = await import('../lib/server/supabase')
  const supabaseServer = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabaseServer.auth.getUser()

  if (!user) {
    return { user: null, tier: 'free', isAdmin: false }
  }

  const ADMIN_EMAILS = ['lakshyajadhav15@gmail.com', 'zedrock@waycord.org']
  const isAdmin = Boolean(user.email && ADMIN_EMAILS.includes(user.email.toLowerCase()))

  if (isAdmin) {
    return { user, tier: 'team', isAdmin: true }
  }

  const { data: subData } = await supabaseServer
    .from('user_subscriptions')
    .select('tier, status')
    .eq('user_id', user.id)
    .maybeSingle()

  const activeTier = subData?.status === 'active' ? (subData.tier as 'pro' | 'team') : 'free'
  return { user, tier: activeTier, isAdmin: false }
})

export const initiatePhonePeCheckout = createServerFn({ method: 'POST' })
  .validator((data: { plan: 'pro' | 'team'; siteUrl: string }) => data)
  .handler(async ({ data }) => {
    const { createServerSupabaseClient, createServerServiceClient } = await import(
      '../lib/server/supabase'
    )
    const { createPhonePePayload, getPhonePeConfig } = await import('../lib/server/phonepe')

    const supabaseServer = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabaseServer.auth.getUser()

    if (!user) {
      return { error: 'Authentication required. Please sign in.', redirectUrl: '/login' }
    }

    const plan = data.plan || 'pro'
    const amountInPaise = plan === 'pro' ? 14900 : 24900
    const merchantTransactionId = `WC_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const supabaseService = createServerServiceClient()

    const { error: txError } = await supabaseService.from('payment_transactions').insert({
      user_id: user.id,
      merchant_transaction_id: merchantTransactionId,
      provider: 'phonepe',
      plan,
      amount: amountInPaise,
      currency: 'INR',
      status: 'pending',
      metadata: {
        user_email: user.email,
        initiated_at: new Date().toISOString(),
      },
    })

    if (txError) {
      console.error('Failed to log payment transaction:', txError)
    }

    const redirectUrl = `${data.siteUrl}/account?tab=billing&txn=${merchantTransactionId}&status=success`
    const callbackUrl = `${data.siteUrl}/api/webhooks/phonepe`

    const { base64Payload, xVerify } = createPhonePePayload({
      merchantTransactionId,
      merchantUserId: user.id,
      amountInPaise,
      redirectUrl,
      callbackUrl,
    })

    const config = getPhonePeConfig()

    if (config.merchantId !== 'MOCK_MERCHANT' && process.env.PHONEPE_SALT_KEY) {
      try {
        const response = await fetch(`${config.apiBase}/pg/v1/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            accept: 'application/json',
          },
          body: JSON.stringify({ request: base64Payload }),
        })
        const resData = await response.json()
        if (resData?.data?.instrumentResponse?.redirectInfo?.url) {
          return { url: resData.data.instrumentResponse.redirectInfo.url }
        }
      } catch (e) {
        console.warn('PhonePe direct dispatch fallback:', e)
      }
    }

    const simulatorUrl = `${data.siteUrl}/account?tab=billing&simulated_success=true&txn=${merchantTransactionId}&plan=${plan}`
    return { url: simulatorUrl }
  })

export const initiatePatreonOAuth = createServerFn({ method: 'POST' })
  .validator((data: { siteUrl: string }) => data)
  .handler(async ({ data }) => {
    const clientId = process.env.PATREON_CLIENT_ID || 'mock_patreon_client'
    const redirectUri = `${data.siteUrl}/api/auth/patreon/callback`
    const state = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const patreonUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&state=${state}&scope=identity%20identity.memberships`
    return { url: patreonUrl }
  })

export const Route = createFileRoute('/upgrade')({
  validateSearch: (search) => upgradeSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: 'Upgrade Plan | Waycord' },
      { name: 'description', content: 'Unlock unlimited devices, voice capture, and full offline features.' },
    ],
  }),
  component: UpgradePage,
})

function UpgradePage() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'team'>(search.plan || 'pro')
  const [user, setUser] = useState<any>(null)
  const [currentTier, setCurrentTier] = useState<'free' | 'pro' | 'team'>('free')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate({
          to: '/login',
          search: { redirect: `/upgrade?plan=${selectedPlan}` },
        })
      } else {
        setUser(session.user)
      }
    })

    fetchCurrentSubscription().then((res) => {
      if (res?.tier) {
        setCurrentTier(res.tier as 'free' | 'pro' | 'team')
      }
    })
  }, [navigate, selectedPlan])

  const handlePhonePeCheckout = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const siteUrl = window.location.origin
      const result = await initiatePhonePeCheckout({
        data: { plan: selectedPlan, siteUrl },
      })

      if (result.error) {
        setErrorMsg(result.error)
        if (result.redirectUrl) {
          navigate({ to: result.redirectUrl as any })
        }
        return
      }

      if (result.url) {
        window.location.href = result.url
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment initiation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePatreonCheckout = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const siteUrl = window.location.origin
      const result = await initiatePatreonOAuth({
        data: { siteUrl },
      })
      if (result.url) {
        window.location.href = result.url
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Patreon redirect failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-14 sm:px-6 lg:px-8 bg-[#1E2124]">
      <div className="text-center mb-10">
        <span className="font-mono text-xs uppercase tracking-wider text-[#88C0A4] font-semibold px-2 py-0.5 rounded bg-[#272A2D] border border-[#3B3E42]">
          Instant Activation
        </span>
        <h1 className="text-2xl sm:text-4xl font-bold text-[#F8FAFC] mt-3 tracking-tight">
          Choose Your Plan
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto">
          Fast offline speed, private cloud sync, and unlimited daily voice capture.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 rounded bg-[#FF5252]/10 border border-[#FF5252]/30 text-[#FF5252] text-xs text-center">
          {errorMsg}
        </div>
      )}

      {/* Plan Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div
          onClick={() => setSelectedPlan('pro')}
          className={`cursor-pointer p-5 rounded border transition-colors relative ${
            selectedPlan === 'pro'
              ? 'border-[#88C0A4] bg-[#272A2D]'
              : 'border-[#3B3E42] bg-[#272A2D]/60 hover:border-[#94A3B8]'
          }`}
        >
          {currentTier === 'pro' ? (
            <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded bg-[#88C0A4] text-[#1E2124] font-mono text-[9px] font-bold uppercase">
              Current Plan
            </div>
          ) : selectedPlan === 'pro' ? (
            <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded bg-[#88C0A4] text-[#1E2124] font-mono text-[9px] font-bold uppercase">
              Selected
            </div>
          ) : null}
          <h3 className="text-base font-bold text-[#F8FAFC]">Waycord Pro</h3>
          <p className="text-xs text-[#94A3B8] mb-3">For students, builders, and active coordinators.</p>
          <div className="mb-3">
            <span className="text-2xl font-black text-[#F8FAFC]">₹149</span>
            <span className="text-xs text-[#94A3B8]"> / month</span>
            <span className="text-[11px] text-[#94A3B8] block font-mono">(or $3.99/mo via Patreon)</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#F8FAFC]">
            <li className="flex items-center space-x-2">
              <span className="text-[#88C0A4] font-bold">✓</span>
              <span>Unlimited devices & offline pro mode</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-[#88C0A4] font-bold">✓</span>
              <span>Unlimited voice capture & audio summaries</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-[#88C0A4] font-bold">✓</span>
              <span>Workspaces up to 15 members</span>
            </li>
          </ul>
        </div>

        <div
          onClick={() => setSelectedPlan('team')}
          className={`cursor-pointer p-5 rounded border transition-colors relative ${
            selectedPlan === 'team'
              ? 'border-[#88C0A4] bg-[#272A2D]'
              : 'border-[#3B3E42] bg-[#272A2D]/60 hover:border-[#94A3B8]'
          }`}
        >
          {currentTier === 'team' ? (
            <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded bg-[#88C0A4] text-[#1E2124] font-mono text-[9px] font-bold uppercase">
              Current Plan
            </div>
          ) : selectedPlan === 'team' ? (
            <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded bg-[#88C0A4] text-[#1E2124] font-mono text-[9px] font-bold uppercase">
              Selected
            </div>
          ) : null}
          <h3 className="text-base font-bold text-[#F8FAFC]">Team / Campus</h3>
          <p className="text-xs text-[#94A3B8] mb-3">For university labs, student clubs, and teams.</p>
          <div className="mb-3">
            <span className="text-2xl font-black text-[#F8FAFC]">₹249</span>
            <span className="text-xs text-[#94A3B8]"> / seat / mo</span>
          </div>
          <ul className="space-y-1.5 text-xs text-[#F8FAFC]">
            <li className="flex items-center space-x-2">
              <span className="text-[#88C0A4] font-bold">✓</span>
              <span>Unlimited team members & workspaces</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-[#88C0A4] font-bold">✓</span>
              <span>Team roles & administrative controls</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-[#88C0A4] font-bold">✓</span>
              <span>Priority direct support hotline</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Payment Selection Box */}
      <div className="p-6 rounded bg-[#272A2D] border border-[#3B3E42]">
        <h3 className="text-sm font-bold text-[#F8FAFC] mb-1">Select Payment Method</h3>
        <p className="text-xs text-[#94A3B8] mb-5">
          Protected by our 5-day money-back guarantee. Cancel anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={handlePhonePeCheckout}
            className="p-4 rounded bg-[#1E2124] border border-[#3B3E42] hover:border-[#88C0A4] text-left transition group active:scale-98"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#88C0A4] transition">
                UPI / RuPay / Cards
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#272A2D] text-[#88C0A4] border border-[#3B3E42]">
                India (INR)
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Google Pay, PhonePe, Paytm, Debit/Credit Cards or Netbanking.
            </p>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handlePatreonCheckout}
            className="p-4 rounded bg-[#1E2124] border border-[#3B3E42] hover:border-[#88C0A4] text-left transition group active:scale-98"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[#F8FAFC] group-hover:text-[#88C0A4] transition">
                Patreon Membership
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#272A2D] text-[#88C0A4] border border-[#3B3E42]">
                Global ($USD)
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              International credit cards and currency conversion via Patreon.
            </p>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-[#3B3E42] flex flex-col sm:flex-row items-center justify-between text-xs text-[#94A3B8] gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#88C0A4]"></span>
            <span>100% unconditional 5-day money-back guarantee.</span>
          </div>
          <Link to="/refund-policy" className="text-[#88C0A4] hover:underline">
            Refund Terms →
          </Link>
        </div>
      </div>
    </div>
  )
}
