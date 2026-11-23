import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  fetchAdminDashboardStats,
  fetchFeedbackItems,
  fetchAdminSubscriptions,
  updateUserTier,
  fetchAdminTransactions,
} from '../lib/server/adminFunctions'

interface AdminConsoleModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminConsoleModal({ isOpen, onClose }: AdminConsoleModalProps) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'feedback' | 'subscriptions' | 'transactions'>('overview')
  const [stats, setStats] = useState<any>(null)
  const [feedback, setFeedback] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    loadAllData()

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const statsRes = await fetchAdminDashboardStats()
      setStats(statsRes.stats)
      setAdminEmail(statsRes.adminEmail || 'Admin')

      const [fbRes, subRes, txRes] = await Promise.all([
        fetchFeedbackItems(),
        fetchAdminSubscriptions(),
        fetchAdminTransactions(),
      ])

      setFeedback(fbRes.feedback || [])
      setSubscriptions(subRes.subscriptions || [])
      setTransactions(txRes.transactions || [])
    } catch (e: any) {
      setActionMsg(`Failed to load ops data: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleTierChange = async (userId: string, newPlan: 'free' | 'pro') => {
    try {
      await updateUserTier({ data: { userId, plan: newPlan } })
      setActionMsg(`Successfully changed user ${userId.slice(0, 8)}... to ${newPlan.toUpperCase()}`)
      loadAllData()
    } catch (e: any) {
      setActionMsg(`Error: ${e.message}`)
    }
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-[#1A1C1E] text-[#F8FAFC]">
      {/* Operator Safety Header */}
      <div className="bg-red-950/95 border-b border-red-800/40 px-4 py-2.5 text-center text-xs text-red-200 font-mono flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-bold tracking-wide">WAYCORD PRODUCTION OPERATOR CONSOLE</span>
          <span className="hidden sm:inline text-red-300">• AUTHENTICATED: {adminEmail}</span>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded bg-red-900 hover:bg-red-800 text-white font-mono text-xs transition cursor-pointer flex items-center gap-1.5"
        >
          <span>Close Console</span>
          <span className="text-[10px] bg-black/40 px-1 rounded">Esc</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#33363A] gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-[#88C0A4]">Waycord</span> Operator Console
            </h1>
            <p className="text-xs text-[#8A8E94] mt-1 font-mono">
              Live database telemetry, user entitlements, and feedback triage.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#88C0A4] text-[#1E2124]'
                  : 'bg-[#272A2D] text-[#8A8E94] hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'feedback'
                  ? 'bg-[#88C0A4] text-[#1E2124]'
                  : 'bg-[#272A2D] text-[#8A8E94] hover:text-white'
              }`}
            >
              <span>Feedback</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                {feedback.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'subscriptions'
                  ? 'bg-[#88C0A4] text-[#1E2124]'
                  : 'bg-[#272A2D] text-[#8A8E94] hover:text-white'
              }`}
            >
              <span>Subscriptions</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                {subscriptions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'transactions'
                  ? 'bg-[#88C0A4] text-[#1E2124]'
                  : 'bg-[#272A2D] text-[#8A8E94] hover:text-white'
              }`}
            >
              <span>Transactions</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30">
                {transactions.length}
              </span>
            </button>
            <button
              onClick={loadAllData}
              className="p-1.5 rounded bg-[#272A2D] text-[#8A8E94] hover:text-white border border-[#383C41] ml-2 cursor-pointer transition flex items-center justify-center"
              title="Refresh All"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action / Notification Banner */}
        {actionMsg && (
          <div className="mt-4 p-3 rounded bg-[#88C0A4]/15 border border-[#88C0A4]/30 text-[#88C0A4] text-xs font-mono flex justify-between items-center">
            <span>{actionMsg}</span>
            <button onClick={() => setActionMsg(null)} className="text-white/60 hover:text-white cursor-pointer">✕</button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-lg bg-[#232629] border border-[#33363A]">
                <div className="text-xs font-mono text-[#8A8E94]">WAYCORD PRO USERS</div>
                <div className="text-3xl font-bold text-[#88C0A4] mt-2">
                  {loading ? '...' : stats?.proUsers ?? 0}
                </div>
                <div className="text-[11px] text-[#8A8E94] mt-1">Paid subscribers with unlimited sync</div>
              </div>

              <div className="p-5 rounded-lg bg-[#232629] border border-[#33363A]">
                <div className="text-xs font-mono text-[#8A8E94]">FREE USERS</div>
                <div className="text-3xl font-bold text-white mt-2">
                  {loading ? '...' : stats?.freeUsers ?? 0}
                </div>
                <div className="text-[11px] text-[#8A8E94] mt-1">Active baseline accounts</div>
              </div>

              <div className="p-5 rounded-lg bg-[#232629] border border-[#33363A]">
                <div className="text-xs font-mono text-[#8A8E94]">PENDING FEEDBACK</div>
                <div className="text-3xl font-bold text-amber-400 mt-2">
                  {loading ? '...' : stats?.totalFeedback ?? 0}
                </div>
                <div className="text-[11px] text-[#8A8E94] mt-1">In-app bug reports & suggestions</div>
              </div>

              <div className="p-5 rounded-lg bg-[#232629] border border-[#33363A]">
                <div className="text-xs font-mono text-[#8A8E94]">TOTAL TRANSACTIONS</div>
                <div className="text-3xl font-bold text-indigo-400 mt-2">
                  {loading ? '...' : stats?.totalTransactions ?? 0}
                </div>
                <div className="text-[11px] text-[#8A8E94] mt-1">PhonePe & Patreon events</div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-[#232629] border border-[#33363A]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Operator Security & Guidelines
              </h2>
              <div className="mt-3 text-xs text-[#8A8E94] space-y-2 leading-relaxed">
                <p>• <strong>Strict Server Checks:</strong> Every telemetry and mutation request validates your Supabase session token against admin emails on the server.</p>
                <p>• <strong>Subscriptions:</strong> Manually override customer tiers to resolve billing inquiries or grant institutional trials.</p>
                <p>• <strong>Feedback:</strong> Triage user submissions directly from the application feedback dialog.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="mt-6">
            <div className="rounded-lg bg-[#232629] border border-[#33363A] overflow-hidden">
              <div className="p-4 border-b border-[#33363A] flex justify-between items-center">
                <h3 className="text-sm font-bold text-white font-mono">USER FEEDBACK INBOX</h3>
                <span className="text-xs text-[#8A8E94]">{feedback.length} entries</span>
              </div>

              {feedback.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#8A8E94] font-mono">
                  No feedback reports submitted yet.
                </div>
              ) : (
                <div className="divide-y divide-[#33363A]">
                  {feedback.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-[#282B2E] transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-semibold text-sm text-[#88C0A4]">
                            {item.name || 'Anonymous User'}
                          </span>
                          <span className="text-xs text-[#8A8E94] ml-2 font-mono">
                            {item.email || 'No email provided'}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8A8E94] font-mono">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-[#E2E8F0] whitespace-pre-wrap leading-relaxed bg-[#1E2124] p-3 rounded border border-[#33363A]/60">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <div className="mt-6">
            <div className="rounded-lg bg-[#232629] border border-[#33363A] overflow-hidden">
              <div className="p-4 border-b border-[#33363A] flex justify-between items-center">
                <h3 className="text-sm font-bold text-white font-mono">USER ENTITLEMENTS & TIERS</h3>
                <span className="text-xs text-[#8A8E94]">{subscriptions.length} active records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1E2124] text-[#8A8E94] font-mono border-b border-[#33363A]">
                    <tr>
                      <th className="p-3">User ID</th>
                      <th className="p-3">Current Plan</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Last Updated</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#33363A]">
                    {subscriptions.map((sub) => (
                      <tr key={sub.user_id} className="hover:bg-[#282B2E]">
                        <td className="p-3 font-mono text-white/90">{sub.user_id}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                              sub.plan === 'pro'
                                ? 'bg-[#88C0A4]/20 text-[#88C0A4] border border-[#88C0A4]/30'
                                : 'bg-[#383C41] text-[#8A8E94]'
                            }`}
                          >
                            {sub.plan}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-[#8A8E94]">{sub.status}</td>
                        <td className="p-3 font-mono text-[11px] text-[#8A8E94]">
                          {new Date(sub.updated_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {sub.plan === 'pro' ? (
                            <button
                              onClick={() => handleTierChange(sub.user_id, 'free')}
                              className="px-2.5 py-1 rounded bg-red-950/40 text-red-300 border border-red-800/40 hover:bg-red-900/60 font-mono text-[10px] cursor-pointer"
                            >
                              Downgrade Free
                            </button>
                          ) : (
                            <button
                              onClick={() => handleTierChange(sub.user_id, 'pro')}
                              className="px-2.5 py-1 rounded bg-[#88C0A4]/20 text-[#88C0A4] border border-[#88C0A4]/40 hover:bg-[#88C0A4]/30 font-mono text-[10px] font-bold cursor-pointer"
                            >
                              Grant Pro
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="mt-6">
            <div className="rounded-lg bg-[#232629] border border-[#33363A] overflow-hidden">
              <div className="p-4 border-b border-[#33363A] flex justify-between items-center">
                <h3 className="text-sm font-bold text-white font-mono">PAYMENT TRANSACTIONS & WEBHOOKS</h3>
                <span className="text-xs text-[#8A8E94]">{transactions.length} records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1E2124] text-[#8A8E94] font-mono border-b border-[#33363A]">
                    <tr>
                      <th className="p-3">Txn ID</th>
                      <th className="p-3">User ID</th>
                      <th className="p-3">Gateway</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#33363A]">
                    {transactions.map((tx) => (
                      <tr key={tx.id || tx.transaction_id} className="hover:bg-[#282B2E]">
                        <td className="p-3 font-mono text-[#88C0A4]">{tx.transaction_id || tx.id}</td>
                        <td className="p-3 font-mono text-[#8A8E94]">{tx.user_id?.slice(0, 8)}...</td>
                        <td className="p-3 font-mono uppercase">{tx.provider || 'PhonePe'}</td>
                        <td className="p-3 font-bold text-white">
                          {tx.amount ? `₹${(tx.amount / 100).toFixed(2)}` : '₹149.00'}
                        </td>
                        <td className="p-3 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              tx.status === 'COMPLETED' || tx.status === 'SUCCESS'
                                ? 'bg-emerald-950/40 text-emerald-300'
                                : 'bg-amber-950/40 text-amber-300'
                            }`}
                          >
                            {tx.status || 'SUCCESS'}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[#8A8E94]">
                          {new Date(tx.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
