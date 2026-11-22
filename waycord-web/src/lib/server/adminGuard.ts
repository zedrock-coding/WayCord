import { createServerSupabaseClient } from './supabase'

const DEFAULT_ADMIN_EMAILS = [
  'lakshyajadhav15@gmail.com',
  'kirajain2001@gmail.com',
  'zedrock@waycord.org',
]

export async function verifyAdminUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || !user.email) {
    return { isAdmin: false, user: null, reason: 'unauthenticated' }
  }

  const configuredAdmins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  const adminList = new Set([...DEFAULT_ADMIN_EMAILS, ...configuredAdmins])

  if (!adminList.has(user.email.toLowerCase())) {
    return { isAdmin: false, user, reason: 'unauthorized' }
  }

  return { isAdmin: true, user, reason: null }
}
