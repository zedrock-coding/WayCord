import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { createServerServiceClient } from './supabase'
import { verifyAdminUser } from './adminGuard'

export const fetchAdminDashboardStats = createServerFn({ method: 'GET' }).handler(
  async () => {
    const auth = await verifyAdminUser()
    if (!auth.isAdmin) {
      throw new Error('Unauthorized: Admin access required')
    }

    const supabase = createServerServiceClient()

    // 1. Total Subscriptions
    const { count: proCount } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('plan', 'pro')

    const { count: freeCount } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('plan', 'free')

    // 2. Feedback Count
    const { count: feedbackCount } = await supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true })

    // 3. Transactions Count
    const { count: txCount } = await supabase
      .from('payment_transactions')
      .select('*', { count: 'exact', head: true })

    return {
      adminEmail: auth.user?.email,
      stats: {
        proUsers: proCount ?? 0,
        freeUsers: freeCount ?? 0,
        totalFeedback: feedbackCount ?? 0,
        totalTransactions: txCount ?? 0,
      },
    }
  }
)

export const fetchFeedbackItems = createServerFn({ method: 'GET' }).handler(
  async () => {
    const auth = await verifyAdminUser()
    if (!auth.isAdmin) {
      throw new Error('Unauthorized: Admin access required')
    }

    const supabase = createServerServiceClient()
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return { feedback: [] }
    }

    return { feedback: data || [] }
  }
)

export const fetchAdminSubscriptions = createServerFn({ method: 'GET' }).handler(
  async () => {
    const auth = await verifyAdminUser()
    if (!auth.isAdmin) {
      throw new Error('Unauthorized: Admin access required')
    }

    const supabase = createServerServiceClient()
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) {
      return { subscriptions: [] }
    }

    return { subscriptions: data || [] }
  }
)

export const updateUserTier = createServerFn({ method: 'POST' })
  .validator((data: { userId: string; plan: 'free' | 'pro'; status?: string }) =>
    z
      .object({
        userId: z.string().uuid(),
        plan: z.enum(['free', 'pro']),
        status: z.string().optional(),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    const auth = await verifyAdminUser()
    if (!auth.isAdmin) {
      throw new Error('Unauthorized: Admin access required')
    }

    const supabase = createServerServiceClient()
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: data.userId,
        plan: data.plan,
        status: data.status || 'active',
        updated_at: new Date().toISOString(),
      })

    if (error) {
      throw new Error(`Failed to update user tier: ${error.message}`)
    }

    return { success: true, plan: data.plan }
  })

export const fetchAdminTransactions = createServerFn({ method: 'GET' }).handler(
  async () => {
    const auth = await verifyAdminUser()
    if (!auth.isAdmin) {
      throw new Error('Unauthorized: Admin access required')
    }

    const supabase = createServerServiceClient()
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return { transactions: [] }
    }

    return { transactions: data || [] }
  }
)
