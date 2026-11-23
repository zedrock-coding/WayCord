import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { supabase } from '../lib/supabase/client'

const accountSearchSchema = z.object({
  tab: z.enum(['profile', 'security', 'billing']).optional(),
  simulated_success: z.string().optional(),
  txn: z.string().optional(),
  plan: z.string().optional(),
  status: z.string().optional(),
})

export const fetchAccountData = createServerFn({ method: 'GET' }).handler(async () => {
  const { createServerSupabaseClient } = await import('../lib/server/supabase')
  const { generateOfflineLicense } = await import('../lib/server/offlineLicense')

  const supabaseServer = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabaseServer.auth.getUser()

  if (!user) {
    return { user: null, subscription: null, transactions: [], isAdmin: false }
  }

  const ADMIN_EMAILS = ['lakshyajadhav15@gmail.com', 'zedrock@waycord.org']
  const isAdmin = Boolean(user.email && ADMIN_EMAILS.includes(user.email.toLowerCase()))

  const { data: subData } = await supabaseServer
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: txData } = await supabaseServer
    .from('payment_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  let effectiveSub = subData
  if (isAdmin) {
    const adminLicense = generateOfflineLicense(user.id, 'team', 'dev_override', 3650)
    effectiveSub = {
      ...subData,
      user_id: user.id,
      tier: 'team',
      status: 'active',
      provider: 'admin',
      provider_customer_id: user.id,
      provider_subscription_id: 'ADMIN_PERMANENT_LICENSE',
      current_period_end: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      signed_entitlement_jwt: adminLicense,
      updated_at: new Date().toISOString(),
    }
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata || {},
    },
    subscription: effectiveSub,
    transactions: txData || [],
    isAdmin,
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

    try {
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
    } catch (err: any) {
      return { success: false, error: err.message || 'Operation failed' }
    }
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

  try {
    const supabaseService = createServerServiceClient()
    await supabaseService
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Operation failed' }
  }
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

    try {
      const supabaseService = createServerServiceClient()
      const { data: tx } = await supabaseService
        .from('payment_transactions')
        .select('*')
        .eq('merchant_transaction_id', data.txnId)
        .eq('user_id', user.id)
        .maybeSingle()

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
          error: 'Refund request window (5 days) has expired for this transaction.',
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
    } catch (err: any) {
      return { success: false, error: err.message || 'Operation failed' }
    }
  })

export const Route = createFileRoute('/account')({
  validateSearch: (search) => accountSearchSchema.parse(search),
  loader: async () => {
    return await fetchAccountData()
  },
  head: () => ({
    meta: [
      { title: 'Account & Subscriptions | Waycord' },
      { name: 'description', content: 'Manage profile picture, display name, credentials, active plan, and offline access tokens.' },
    ],
  }),
  component: AccountPage,
})

function AccountPage() {
  const search = Route.useSearch()
  const initialData = Route.useLoaderData()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [data, setData] = useState(initialData)
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing'>(
    search.tab || 'profile',
  )

  // Profile Form States
  const [displayName, setDisplayName] = useState(
    (data.user?.user_metadata?.full_name as string) || '',
  )
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    (data.user?.user_metadata?.avatar_url as string) || null,
  )
  const [isSavingName, setIsSavingName] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Password Form States
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Action / Feedback Messages
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  )
  const [copiedToken, setCopiedToken] = useState(false)
  const [copiedUid, setCopiedUid] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !data.user) {
        navigate({ to: '/login', search: { redirect: '/account' } })
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
          fetchAccountData().then(setData)
        }
      })
    }
  }, [search.simulated_success, search.txn, search.plan])

  // Profile Save Handler
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = displayName.trim()
    if (!trimmed) {
      setActionMsg({ type: 'error', text: 'Display name cannot be empty.' })
      return
    }

    setIsSavingName(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: trimmed },
      })
      if (error) throw error
      setActionMsg({ type: 'success', text: 'Display name saved successfully!' })
      const refreshed = await fetchAccountData()
      setData(refreshed)
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to update name.' })
    } finally {
      setIsSavingName(false)
    }
  }

  // Profile Picture Upload Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !data.user) return

    if (file.size > 2 * 1024 * 1024) {
      setActionMsg({ type: 'error', text: 'Image size must be less than 2MB.' })
      return
    }

    setIsUploadingAvatar(true)
    try {
      const filePath = `${data.user.id}/profile.jpg`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const freshUrl = `${urlData.publicUrl}?t=${Date.now()}`

      const { error: userError } = await supabase.auth.updateUser({
        data: { avatar_url: freshUrl },
      })
      if (userError) throw userError

      setAvatarUrl(freshUrl)
      setActionMsg({ type: 'success', text: 'Profile picture updated successfully!' })
      const refreshed = await fetchAccountData()
      setData(refreshed)
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Avatar upload failed.' })
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Password Change Handler
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setActionMsg({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setActionMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setIsSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error

      setActionMsg({ type: 'success', text: 'Password updated successfully! Use your new password on next login.' })
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to update password.' })
    } finally {
      setIsSavingPassword(false)
    }
  }

  const sub = data.subscription
  const tier = data.isAdmin ? 'team' : sub?.tier || 'free'
  const status = data.isAdmin ? 'active' : tier === 'free' ? 'active' : sub?.status || 'inactive'
  const currentPeriodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const handleCancel = async () => {
    if (data.isAdmin) return
    if (!confirm('Cancel auto-renewal? You keep Pro access until your current billing period ends.')) {
      return
    }
    setLoading(true)
    try {
      const res = await cancelSubscription()
      if (res.success) {
        setActionMsg({
          type: 'success',
          text: 'Auto-renewal canceled. Access remains active until period end.',
        })
        const refreshed = await fetchAccountData()
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
        const refreshed = await fetchAccountData()
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
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
  }

  const copyUid = () => {
    if (data.user?.id) {
      navigator.clipboard.writeText(data.user.id)
      setCopiedUid(true)
      setTimeout(() => setCopiedUid(false), 2000)
    }
  }

  const userInitial = (displayName || data.user?.email || 'U')[0].toUpperCase()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-[#1E2124] min-h-[calc(100vh-56px)] text-[#F8FAFC]">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#88C0A4] font-semibold px-2 py-0.5 rounded bg-[#272A2D] border border-[#3B3E42]">
              User Portal
            </span>
            {data.isAdmin && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#1E2124] font-bold px-2 py-0.5 rounded bg-[#88C0A4]">
                Admin Highest Tier (Always On)
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] mt-2 tracking-tight">
            Account & Subscriptions
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Manage your personal profile, credentials, active plan, and offline access tokens.
          </p>
        </div>

        <a
          href="/app"
          className="self-start sm:self-auto text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#272A2D] border border-[#3B3E42] text-[#88C0A4] hover:bg-[#2F3236] transition flex items-center gap-1.5"
        >
          <span>Launch Workspace App</span>
          <span>→</span>
        </a>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-1 border-b border-[#3B3E42] mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-[#88C0A4] text-[#88C0A4]'
              : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <span>👤 Profile & Identity</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-[#88C0A4] text-[#88C0A4]'
              : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <span>🔒 Security & Password</span>
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'billing'
              ? 'border-[#88C0A4] text-[#88C0A4]'
              : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          <span>💳 Plan & Subscriptions</span>
        </button>
      </div>

      {/* Action / Notification Banner */}
      {actionMsg && (
        <div
          className={`mb-6 p-3.5 rounded-lg text-xs flex items-center justify-between border ${
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

      {/* TAB 1: PROFILE & IDENTITY */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Avatar & Display Name Box */}
          <div className="p-6 rounded-xl bg-[#232629] border border-[#3B3E42]">
            <h2 className="text-sm font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
              <span>Personal Identity</span>
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-[#3B3E42]">
              {/* Avatar circle */}
              <div className="relative group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-18 h-18 rounded-full object-cover border-2 border-[#88C0A4] bg-[#191C1F]"
                  />
                ) : (
                  <div className="w-18 h-18 rounded-full bg-[#191C1F] border-2 border-[#3B3E42] text-[#88C0A4] font-bold text-xl flex items-center justify-center">
                    {userInitial}
                  </div>
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-[10px] text-white font-mono">
                    ...
                  </div>
                )}
              </div>

              {/* Upload button and helper */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-lg bg-[#272A2D] border border-[#3B3E42] text-xs font-semibold text-[#F8FAFC] hover:border-[#88C0A4] hover:bg-[#2F3236] transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-[#88C0A4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{isUploadingAvatar ? 'Uploading...' : 'Change Profile Photo'}</span>
                </button>
                <p className="text-[11px] text-[#94A3B8] mt-1.5">
                  Supported formats: PNG, JPG, or WEBP (Max 2MB). Syncs automatically with Flutter.
                </p>
              </div>
            </div>

            {/* Display Name Edit Form */}
            <form onSubmit={handleSaveName} className="mt-6 space-y-4 max-w-lg">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1.5">
                  Display / Full Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-1 px-3.5 py-2 rounded-lg bg-[#191C1F] border border-[#3B3E42] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#88C0A4] transition"
                  />
                  <button
                    type="submit"
                    disabled={isSavingName}
                    className="px-4 py-2 rounded-lg bg-[#88C0A4] text-[#1E2124] text-xs font-bold hover:bg-[#9ECBB5] transition disabled:opacity-50"
                  >
                    {isSavingName ? 'Saving...' : 'Save Name'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1.5">
                  Account Email Address
                </label>
                <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-[#191C1F] border border-[#3B3E42]">
                  <span className="text-xs text-[#F8FAFC] font-mono">{data.user?.email}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#88C0A4]/15 text-[#88C0A4] border border-[#88C0A4]/30">
                    VERIFIED
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1.5">
                  User Identifier (UID)
                </label>
                <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-[#191C1F] border border-[#3B3E42]">
                  <span className="text-xs text-[#94A3B8] font-mono truncate max-w-[280px]">
                    {data.user?.id}
                  </span>
                  <button
                    type="button"
                    onClick={copyUid}
                    className="text-xs text-[#88C0A4] hover:underline font-mono ml-2 flex items-center gap-1"
                  >
                    <span>{copiedUid ? 'Copied!' : 'Copy UID'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#232629] border border-[#3B3E42]">
            <h2 className="text-sm font-semibold text-[#F8FAFC] mb-2 flex items-center gap-2">
              <span>Change Password</span>
            </h2>
            <p className="text-xs text-[#94A3B8] mb-6">
              Update your account password for email and password authentication across Waycord Web, Windows, and Android.
            </p>

            <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2 rounded-lg bg-[#191C1F] border border-[#3B3E42] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#88C0A4] transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#94A3B8] hover:text-[#F8FAFC]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#94A3B8] mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#191C1F] border border-[#3B3E42] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#88C0A4] transition"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="px-5 py-2.5 rounded-lg bg-[#88C0A4] text-[#1E2124] text-xs font-bold hover:bg-[#9ECBB5] transition disabled:opacity-50"
                >
                  {isSavingPassword ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PLAN & BILLING */}
      {activeTab === 'billing' && (
        <div>
          {/* Subscription Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Tier Card */}
            <div className="p-5 rounded-xl bg-[#232629] border border-[#3B3E42] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
                    Current Plan
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      data.isAdmin
                        ? 'bg-[#88C0A4] text-[#1E2124]'
                        : status === 'active'
                          ? 'bg-[#88C0A4]/20 text-[#88C0A4]'
                          : 'bg-[#FF5252]/20 text-[#FF5252]'
                    }`}
                  >
                    {data.isAdmin ? 'ADMIN ACTIVE' : status}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-[#F8FAFC] capitalize">
                  Waycord {tier}
                </h3>
                {data.isAdmin ? (
                  <p className="text-[11px] text-[#88C0A4] mt-2 font-mono">
                    Permanent Highest Tier License Unlocked.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#94A3B8] block text-[10px]">Provider</span>
                      <span className="text-[#F8FAFC] font-medium capitalize">
                        {sub?.provider || 'None'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block text-[10px]">Renewal Date</span>
                      <span className="text-[#F8FAFC] font-medium">
                        {currentPeriodEnd || 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block text-[10px]">Device Limit</span>
                      <span className="text-[#F8FAFC] font-medium">
                        {tier === 'team' ? 'Unlimited' : tier === 'pro' ? '5 Devices' : '2 Devices'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!data.isAdmin && (
                <div className="mt-6 pt-4 border-t border-[#3B3E42] flex items-center justify-between">
                  {tier === 'free' ? (
                    <Link
                      to="/upgrade"
                      className="w-full text-center px-4 py-2 rounded bg-[#88C0A4] text-[#1E2124] font-bold text-xs hover:bg-[#9ECBB5] transition"
                    >
                      Upgrade to Pro (₹149/mo)
                    </Link>
                  ) : (
                    <button
                      onClick={handleCancel}
                      disabled={loading || status === 'canceled'}
                      className="text-xs text-[#FF5252] hover:underline disabled:opacity-50"
                    >
                      {status === 'canceled' ? 'Auto-Renewal Inactive' : 'Cancel Subscription'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Offline Access Token Card */}
            <div className="p-5 rounded-xl bg-[#232629] border border-[#3B3E42] md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-[#88C0A4] mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  <h4 className="text-sm font-bold text-[#F8FAFC]">Offline Access Token</h4>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">
                  Your cryptographic token unlocks Pro & Team features in the Flutter application on Android and Windows without an active internet connection.
                </p>

                {sub?.signed_entitlement_jwt ? (
                  <div className="mt-4">
                    <div className="p-3 bg-[#191C1F] rounded border border-[#3B3E42] font-mono text-[11px] text-[#88C0A4] break-all select-all max-h-24 overflow-y-auto">
                      {sub.signed_entitlement_jwt}
                    </div>
                    <div className="mt-3 flex items-center space-x-3">
                      <button
                        onClick={copyLicense}
                        className="px-3 py-1.5 rounded bg-[#272A2D] border border-[#3B3E42] text-xs font-semibold text-[#F8FAFC] hover:border-[#88C0A4] transition flex items-center space-x-1.5"
                      >
                        <span>{copiedToken ? '✓ Copied' : 'Copy Token'}</span>
                      </button>
                      <span className="text-[11px] text-[#94A3B8]">
                        Paste in Desktop/Android app settings under Entitlements.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded bg-[#191C1F] border border-[#3B3E42] text-xs text-[#94A3B8] text-center">
                    Requires Pro or Team tier to unlock offline token.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Receipts & Payment History */}
          <div className="p-6 rounded-xl bg-[#232629] border border-[#3B3E42]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">Receipts & Payment History</h3>
                <p className="text-xs text-[#94A3B8]">
                  5-day money-back guarantee applies to all initial subscriptions.
                </p>
              </div>
              <Link to="/refund-policy" className="text-xs text-[#88C0A4] hover:underline font-mono">
                Refund Terms →
              </Link>
            </div>

            {data.transactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94A3B8] flex flex-col items-center justify-center space-y-2">
                <svg
                  className="w-8 h-8 text-[#3B3E42]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>No previous payments found for this account.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#3B3E42] text-[#94A3B8] font-mono text-[10px] uppercase">
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Plan</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Transaction ID</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B3E42]/50">
                    {data.transactions.map((tx: any) => {
                      const isRefundable =
                        tx.status === 'completed' &&
                        (Date.now() - new Date(tx.created_at).getTime()) / (1000 * 60 * 60 * 24) <= 5

                      return (
                        <tr key={tx.id} className="text-[#F8FAFC]">
                          <td className="py-3 font-mono text-[#94A3B8]">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 font-semibold uppercase">{tx.plan}</td>
                          <td className="py-3 font-mono font-medium">₹{(tx.amount / 100).toFixed(2)}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                                tx.status === 'completed'
                                  ? 'bg-[#88C0A4]/20 text-[#88C0A4]'
                                  : tx.status === 'refunded'
                                    ? 'bg-[#B9C8DE]/20 text-[#B9C8DE]'
                                    : 'bg-[#FF5252]/20 text-[#FF5252]'
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-[#94A3B8] text-[10px]">
                            {tx.merchant_transaction_id}
                          </td>
                          <td className="py-3 text-right">
                            {isRefundable ? (
                              <button
                                onClick={() => handleRefund(tx.merchant_transaction_id)}
                                disabled={loading}
                                className="text-xs text-[#FF5252] hover:underline font-semibold"
                              >
                                Request Refund
                              </button>
                            ) : tx.status === 'refunded' ? (
                              <span className="text-[10px] text-[#94A3B8] italic">Refunded</span>
                            ) : (
                              <span className="text-[10px] text-[#94A3B8]">Standard</span>
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
      )}
    </div>
  )
}
