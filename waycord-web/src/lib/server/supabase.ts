import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getCookies, setCookie } from '@tanstack/react-start/server'

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eknzdxexfcfdmqvbyvxt.supabase.co'
  const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_fUoY96CXli7DwbZayu8pFQ_4yExvoJg'

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const cookies = getCookies()
        return Object.entries(cookies).map(([name, value]) => ({
          name,
          value,
        }))
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          setCookie(name, value, options)
        })
      },
    },
  })
}

export function createServerServiceClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eknzdxexfcfdmqvbyvxt.supabase.co'
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock_service_role_key_for_testing'

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
