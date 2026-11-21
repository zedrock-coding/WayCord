import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eknzdxexfcfdmqvbyvxt.supabase.co'
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_fUoY96CXli7DwbZayu8pFQ_4yExvoJg'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createClient()
