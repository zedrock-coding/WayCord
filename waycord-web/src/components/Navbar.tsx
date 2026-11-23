import { Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/client'
import { AdminConsoleModal } from './AdminConsoleModal'

const ADMIN_EMAILS = ['lakshyajadhav15@gmail.com', 'zedrock@waycord.org']

export function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [showAdminConsole, setShowAdminConsole] = useState(false)

  const isAdmin = Boolean(
    user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (event === 'SIGNED_OUT' || !currentUser) {
        setShowAdminConsole(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!isAdmin) {
      setShowAdminConsole(false)
    }
  }, [isAdmin])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        if (isAdmin) {
          e.preventDefault()
          setShowAdminConsole((prev) => !prev)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAdmin])

  const handleSignOut = async () => {
    setShowAdminConsole(false)
    setUser(null)
    await supabase.auth.signOut()
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#3B3E42] bg-[#1E2124]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <img
            src="/icon.png"
            alt="Waycord"
            className="w-8 h-8 rounded-lg object-contain bg-[#191C1F] border border-[#3B3E42] shadow-sm"
          />
          <span className="font-bold text-base tracking-tight text-[#F8FAFC] group-hover:text-[#88C0A4] transition-colors">
            Waycord
          </span>
          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#272A2D] text-[#88C0A4] border border-[#3B3E42]">
            v0.8.1
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-7 text-xs font-medium text-[#94A3B8]">
          <a href="/#features" className="hover:text-[#88C0A4] transition-colors">
            Features
          </a>
          <a href="/#pricing" className="hover:text-[#88C0A4] transition-colors">
            Pricing
          </a>
          <a href="/#faq" className="hover:text-[#88C0A4] transition-colors">
            FAQ
          </a>
          <Link to="/account" className="hover:text-[#88C0A4] transition-colors">
            Account
          </Link>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowAdminConsole(true)}
              className="text-[#88C0A4] font-semibold hover:underline transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
              title="Open Operator Console (Ctrl+Shift+A)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span>Console</span>
            </button>
          )}
        </nav>

        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/account"
                className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] hidden sm:inline-block truncate max-w-[150px] font-mono"
              >
                {user.email}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-xs px-2.5 py-1 rounded bg-[#272A2D] border border-[#3B3E42] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#88C0A4] transition cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              search={{ redirect: '/app' }}
              className="text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              Sign In
            </Link>
          )}

          <a
            href="/app"
            className="text-xs font-bold px-3 py-1.5 rounded bg-[#88C0A4] text-[#1E2124] hover:bg-[#9ECBB5] transition active:scale-95 flex items-center space-x-1"
          >
            <span>Open App</span>
            <span className="text-[10px]">→</span>
          </a>

          {!isAdmin && (
            <Link
              to="/upgrade"
              className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded bg-[#272A2D] border border-[#3B3E42] text-[#F8FAFC] hover:border-[#88C0A4] transition"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>
      <AdminConsoleModal
        isOpen={showAdminConsole}
        onClose={() => setShowAdminConsole(false)}
      />
    </header>
  )
}
