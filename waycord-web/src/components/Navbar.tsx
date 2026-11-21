import { Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/client'

export function Navbar() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#3B3E42] bg-[#1E2124]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded bg-[#88C0A4] flex items-center justify-center text-[#1E2124] font-black text-sm tracking-wider">
            W
          </div>
          <span className="font-bold text-base tracking-tight text-[#F8FAFC] group-hover:text-[#88C0A4] transition-colors">
            Waycord
          </span>
          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#272A2D] text-[#88C0A4] border border-[#3B3E42]">
            v2.0
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
          <Link to="/billing" className="hover:text-[#88C0A4] transition-colors">
            Billing
          </Link>
          {user && (user.email === 'kirajain2001@gmail.com' || user.email === 'zedrock@waycord.org') && (
            <Link to="/admin" className="text-[#88C0A4] font-semibold hover:underline transition-colors">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/billing"
                className="text-xs text-[#94A3B8] hover:text-[#F8FAFC] hidden sm:inline-block truncate max-w-[150px] font-mono"
              >
                {user.email}
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-xs px-2.5 py-1 rounded bg-[#272A2D] border border-[#3B3E42] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#88C0A4] transition"
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

          <Link
            to="/upgrade"
            className="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded bg-[#272A2D] border border-[#3B3E42] text-[#F8FAFC] hover:border-[#88C0A4] transition"
          >
            Upgrade
          </Link>
        </div>
      </div>
    </header>
  )
}
