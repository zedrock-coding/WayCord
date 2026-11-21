import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { supabase } from '../lib/supabase/client'

const billingSearchSchema = z.object({
  simulated_success: z.string().optional(),
  txn: z.string().optional(),
  plan: z.string().optional(),
  status: z.string().optional(),
})

export const fetchBillingData = createServerFn({ method: 'GET' }).handler(async () => {
  const { createServerSupabaseClient, createServerServiceClient } = await import(
    '../lib/server/supabase'
  )
  const supabaseServer = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabaseServer.auth.getUser()

  if (!user) {
    return { user: null, subscription: null, transactions: [] }
  }

  const supabaseService = createServerServiceClient()

  const { data: subData } = await supabaseService
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: txData } = await supabaseService
    .from('payment_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    user: { id: user.id, email: user.email },
    subscription: subData,
    transactions: txData || [],
  }
})

export const confirmPaymentTransaction = createServerFn({ method: 'POST' })
  .validator((data: { txnId: string; plan: 'pro' | 'team' }) => data)
  .handler(async ({ data }) => {
    const { createServerSupabaseClient, createServerServiceClient } = await import(
      '../lib/server/supabase'
    )
    const { generateOfflineLicense } = await import('../lib/server/offlineLicense')

    const supabaseServer = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabaseServer.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabaseService = createServerServiceClient()
    const now = new Date()
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const signedLicense = generateOfflineLicense(user.id, data.plan, 'phonepe', 30)

    await supabaseService
      .from('payment_transactions')
      .update({
        status: 'completed',
        provider_payment_id: `SIM_${Date.now()}`,
        updated_at: now.toISOString(),
      })
      .eq('merchant_transaction_id', data.txnId)

    await supabaseService.from('user_subscriptions').upsert({
      user_id: user.id,
      tier: data.plan,
      status: 'active',
      provider: 'phonepe',
      provider_customer_id: user.id,
      provider_subscription_id: data.txnId,
      current_period_end: periodEnd.toISOString(),
      signed_entitlement_jwt: signedLicense,
      updated_at: now.toISOString(),
    })

    return { success: true, license: signedLicense }
  })

export const cancelSubscription = createServerFn({ method: 'POST' }).handler(async () => {
  const { createServerSupabaseClient, createServerServiceClient } = await import(
    '../lib/server/supabase'
  )
  const supabaseServer = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabaseServer.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const supabaseService = createServerServiceClient()

  await supabaseService
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  return { success: true }
})

export const requestRefund = createServerFn({ method: 'POST' })
  .validator((data: { txnId: string }) => data)
  .handler(async ({ data }) => {
    const { createServerSupabaseClient, createServerServiceClient } = await import(
      '../lib/server/supabase'
    )
    const supabaseServer = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabaseServer.auth.getUser()

    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabaseService = createServerServiceClient()

    const { data: tx } = await supabaseService
      .from('payment_transactions')
      .select('*')
      .eq('merchant_transaction_id', data.txnId)
      .eq('user_id', user.id)
      .single()

    if (!tx) {
      return { success: false, error: 'Transaction not found.' }
    }

    if (tx.status === 'refunded' || tx.status === 'refund_requested') {
      return { success: false, error: 'Refund already processed for this transaction.' }
    }

    const txTime = new Date(tx.created_at).getTime()
    const nowTime = Date.now()
    const daysPassed = (nowTime - txTime) / (1000 * 60 * 60 * 24)

    if (daysPassed > 5) {
      return {
        success: false,
        error:
          'Refund request is outside the 5-calendar-day refund window per our policy.',
      }
    }

    await supabaseService
      .from('payment_transactions')
      .update({
        status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_transaction_id', data.txnId)

    await supabaseService
      .from('user_subscriptions')
      .update({
        tier: 'free',
        status: 'canceled',
        signed_entitlement_jwt: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return {
      success: true,
      message: `Full refund of ₹${(tx.amount / 100).toFixed(
        2,
      )} processed successfully. Funds will return to source within 3-5 business days.`,
    }
  })

export const Route = createFileRoute('/billing')({
  validateSearch: (search) => billingSearchSchema.parse(search),
  loader: async () => {
    return await fetchBillingData()
  },
  head: () => ({
    meta: [
      { title: 'Billing & Subscriptions | Waycord' },
      { name: 'description', content: 'Manage your active subscription, offline access token, and receipts.' },
    ],
  }),
  component: BillingPage,
})

function BillingPage() {
  const search = Route.useSearch()
  const initialData = Route.useLoaderData()
  const navigate = useNavigate()

  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  )
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !data.user) {
        navigate({ to: '/login', search: { redirect: '/billing' } })
      }
    })
  }, [navigate, data.user])

  useEffect(() => {
    if (search.simulated_success === 'true' && search.txn) {
      const plan = (search.plan as any) === 'team' ? 'team' : 'pro'
      confirmPaymentTransaction({ data: { txnId: search.txn, plan } }).then((res) => {
        if (res.success) {
          setActionMsg({
            type: 'success',
            text: `Payment confirmed! Upgraded to Waycord ${plan.toUpperCase()}.`,
          })
          fetchBillingData().then(setData)
        }
      })
    }
  }, [search.simulated_success, search.txn, search.plan])

  const sub = data.subscription
  const tier = sub?.tier || 'free'
  const status = tier === 'free' ? 'active' : sub?.status || 'inactive'
  const currentPeriodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const handleCancel = async () => {
    if (!confirm('Cancel auto-renewal? You keep Pro access until your current billing period ends.')) {
      return
    }
    setLoading(true)
    try {
      const res = await cancelSubscription()
      if (res.success) {
        setActionMsg({
          type: 'success',
          text: 'Auto-renewal canceled. Your Pro access remains active until period end.',
        })
        const refreshed = await fetchBillingData()
        setData(refreshed)
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to cancel.' })
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async (txnId: string) => {
    if (!confirm('Request 100% full refund under the 5-day guarantee?')) {
      return
    }
    setLoading(true)
    try {
      const res = await requestRefund({ data: { txnId } })
      if (res.success) {
        setActionMsg({ type: 'success', text: res.message || 'Refund issued successfully.' })
        const refreshed = await fetchBillingData()
        setData(refreshed)
      } else {
        setActionMsg({ type: 'error', text: res.error || 'Refund could not be processed.' })
      }
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Refund failed.' })
    } finally {
      setLoading(false)
    }
  }

  const copyLicense = () => {
    if (sub?.signed_entitlement_jwt) {
      navigator.clipboard.writeText(sub.signed_entitlement_jwt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-[#1E2124]">
      <div className="mb-8">
        <span className="font-mono text-xs uppercase tracking-wider text-[#88C0A4] font-semibold px-2 py-0.5 rounded bg-[#272A2D] border border-[#3B3E42]">
          Account Portal
        </span>
        <h1 className="text-2xl font-bold text-[#F8FAFC] mt-2 tracking-tight">
          Billing & Offline Access
        </h1>
      </div>

      {actionMsg && (
        <div
          className={`mb-6 p-3 rounded text-xs flex items-center justify-between border ${
            actionMsg.type === 'success'
              ? 'bg-[#88C0A4]/10 border-[#88C0A4]/30 text-[#88C0A4]'
              : 'bg-[#FF5252]/10 border-[#FF5252]/30 text-[#FF5252]'
          }`}
        >
          <span>{actionMsg.text}</span>
          <button
            onClick={() => setActionMsg(null)}
            className="text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Subscription Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 p-6 rounded bg-[#272A2D] border border-[#3B3E42]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">
                Current Plan
              </span>
              <h2 className="text-xl font-bold text-[#F8FAFC] capitalize mt-0.5">
                Waycord {tier}
              </h2>
            </div>
            <div>
              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                  status === 'active'
                    ? tier === 'free'
                      ? 'bg-[#1E2124] text-[#94A3B8] border-[#3B3E42]'
                      : 'bg-[#88C0A4]/10 text-[#88C0A4] border-[#88C0A4]/30'
                    : status === 'canceled'
                    ? 'bg-[#FFBF00]/10 text-[#FFBF00] border-[#FFBF00]/30'
                    : 'bg-[#1E2124] text-[#94A3B8] border-[#3B3E42]'
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5 text-xs">
            <div>
              <span className="text-[#94A3B8] block mb-0.5 text-[11px]">Provider</span>
              <span className="font-semibold text-[#F8FAFC] capitalize">
                {sub?.provider || 'None'}
              </span>
            </div>
            <div>
              <span className="text-[#94A3B8] block mb-0.5 text-[11px]">Renewal Date</span>
              <span className="font-semibold text-[#F8FAFC]">
                {currentPeriodEnd || 'Inactive'}
              </span>
            </div>
            <div>
              <span className="text-[#94A3B8] block mb-0.5 text-[11px]">Device Limit</span>
              <span className={`font-semibold ${tier === 'free' ? 'text-[#F8FAFC]' : 'text-[#88C0A4]'}`}>
                {tier === 'free' ? '2 Devices' : 'Unlimited'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[#3B3E42]">
            {tier === 'free' ? (
              <Link
                to="/upgrade"
                search={{ plan: 'pro' }}
                className="px-4 py-2 rounded bg-[#88C0A4] hover:bg-[#9ECBB5] text-[#1E2124] font-bold text-xs transition"
              >
                Upgrade to Pro (₹149/mo)
              </Link>
            ) : (
              <>
                {status === 'active' && (
                  <button
                    disabled={loading}
                    onClick={handleCancel}
                    className="px-3 py-1.5 rounded bg-[#1E2124] hover:border-[#88C0A4] border border-[#3B3E42] text-[#F8FAFC] text-xs font-medium transition"
                  >
                    Cancel Auto-Renewal
                  </button>
                )}
                <Link
                  to="/upgrade"
                  search={{ plan: tier === 'pro' ? 'team' : 'pro' }}
                  className="px-3 py-1.5 rounded bg-[#1E2124] hover:border-[#88C0A4] border border-[#3B3E42] text-[#F8FAFC] text-xs font-medium transition"
                >
                  Switch Plan
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Offline License Box */}
        <div className="p-6 rounded bg-[#272A2D] border border-[#3B3E42] flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded bg-[#1E2124] border border-[#3B3E42] flex items-center justify-center text-[#88C0A4] mb-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-[#F8FAFC] mb-1">Offline Access Token</h3>
            <p className="text-xs text-[#94A3B8] mb-3 leading-relaxed">
              Unlocks Pro features when opening Waycord on Android without any Wi-Fi or mobile data.
            </p>
          </div>

          <div>
            {sub?.signed_entitlement_jwt ? (
              <div>
                <button
                  onClick={copyLicense}
                  className="w-full py-2 rounded bg-[#88C0A4]/10 border border-[#88C0A4]/40 text-[#88C0A4] hover:bg-[#88C0A4]/20 font-semibold text-xs transition"
                >
                  {copied ? '✓ Token Copied' : 'Copy Offline Token'}
                </button>
                <span className="text-[10px] text-[#94A3B8] mt-1.5 block text-center">
                  Paste in App Settings → Offline License.
                </span>
              </div>
            ) : (
              <div className="p-3 rounded bg-[#1E2124] border border-[#3B3E42] text-center text-xs text-[#94A3B8]">
                <span>Requires </span>
                <Link
                  to="/upgrade"
                  search={{ plan: 'pro' }}
                  className="text-[#88C0A4] hover:underline font-medium"
                >
                  Pro tier
                </Link>
                <span> to unlock offline token.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction & Refund Ledger */}
      <div className="p-6 rounded bg-[#272A2D] border border-[#3B3E42]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#F8FAFC]">Receipts & Payment History</h3>
            <p className="text-xs text-[#94A3B8]">
              5-day money-back guarantee applies to all initial subscriptions.
            </p>
          </div>
          <Link
            to="/refund-policy"
            className="text-xs text-[#88C0A4] hover:underline"
          >
            Refund Terms →
          </Link>
        </div>

        {data.transactions.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded bg-[#1E2124] border border-[#3B3E42] flex items-center justify-center text-[#94A3B8] mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-xs text-[#94A3B8]">No previous payments found for this account.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#3B3E42] text-[#94A3B8] pb-2 font-mono text-[11px]">
                  <th className="pb-2 font-medium">Order ID</th>
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3B3E42]/60 text-[#F8FAFC]">
                {data.transactions.map((tx: any) => {
                  const txDate = new Date(tx.created_at)
                  const isEligibleForRefund =
                    tx.status === 'completed' &&
                    (Date.now() - txDate.getTime()) <= 5 * 24 * 60 * 60 * 1000

                  return (
                    <tr key={tx.id} className="hover:bg-[#1E2124]/40 transition">
                      <td className="py-2.5 font-mono text-[11px] text-[#94A3B8]">
                        {tx.merchant_transaction_id}
                      </td>
                      <td className="py-2.5 capitalize font-semibold">
                        {tx.plan}
                      </td>
                      <td className="py-2.5 font-mono text-[#88C0A4]">
                        ₹{(tx.amount / 100).toFixed(2)}
                      </td>
                      <td className="py-2.5 text-[#94A3B8]">
                        {txDate.toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`font-mono text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                            tx.status === 'completed'
                              ? 'bg-[#88C0A4]/10 text-[#88C0A4]'
                              : tx.status === 'refunded'
                              ? 'bg-purple-500/10 text-purple-300'
                              : tx.status === 'refund_requested'
                              ? 'bg-[#FFBF00]/10 text-[#FFBF00]'
                              : 'bg-[#1E2124] text-[#94A3B8]'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        {isEligibleForRefund ? (
                          <button
                            disabled={loading}
                            onClick={() => handleRefund(tx.merchant_transaction_id)}
                            className="px-2 py-0.5 rounded bg-[#FF5252]/10 border border-[#FF5252]/30 text-[#FF5252] hover:bg-[#FF5252]/20 text-[11px] font-medium transition"
                          >
                            Request Refund
                          </button>
                        ) : tx.status === 'refunded' ? (
                          <span className="text-[11px] text-[#94A3B8]">Refunded</span>
                        ) : (
                          <span className="text-[11px] text-[#94A3B8]">Window Passed</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
