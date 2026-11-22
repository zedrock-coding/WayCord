import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eknzdxexfcfdmqvbyvxt.supabase.co'
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_fUoY96CXli7DwbZayu8pFQ_4yExvoJg'

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey)

  if (typeof window !== 'undefined') {
    try {
      const projectRef = new URL(supabaseUrl).host.split('.')[0]
      const storageKey = `sb-${projectRef}-auth-token`

      const syncSessionToStorage = (session: any) => {
        try {
          if (session) {
            window.localStorage.setItem(storageKey, JSON.stringify(session))
          } else {
            window.localStorage.removeItem(storageKey)
          }
        } catch (_) {}
      }

      // 1. Sync on state change (login, logout, refresh)
      client.auth.onAuthStateChange((event, session) => {
        syncSessionToStorage(session)
      })

      // 2. Initial synchronization on page load
      client.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          syncSessionToStorage(session)
        } else {
          // If cookies had no session, check if Flutter app stored one in localStorage
          try {
            const stored = window.localStorage.getItem(storageKey)
            if (stored) {
              const parsed = JSON.parse(stored)
              if (parsed?.access_token && parsed?.refresh_token) {
                client.auth.setSession({
                  access_token: parsed.access_token,
                  refresh_token: parsed.refresh_token,
                }).then(({ data }) => {
                  if (data.session) {
                    syncSessionToStorage(data.session)
                  }
                }).catch(() => {})
              }
            }
          } catch (_) {}
        }
      })
    } catch (_) {}
  }

  return client
}

export const supabase = createClient()
