import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { supabase } from '../lib/supabase/client'

const loginSearchSchema = z.object({
  redirect: z.string().optional().catch('/app'),
})

export const Route = createFileRoute('/login')({
  validateSearch: (search) => loginSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: 'Sign In | Waycord' },
      { name: 'description', content: 'Sign in to access your Waycord account and subscription portal.' },
    ],
  }),
  component: LoginPage,
})

function sanitizeRedirect(url?: string): string {
  if (!url) return '/app'
  if (url.startsWith('/') && !url.startsWith('//')) {
    return url
  }
  return '/app'
}

function LoginPage() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const redirectTarget = sanitizeRedirect(search.redirect)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const proceedToTarget = (target: string) => {
    if (typeof window !== 'undefined' && target.startsWith('/app')) {
      window.location.href = target
    } else {
      navigate({ to: target as any })
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        proceedToTarget(redirectTarget)
      }
    })
  }, [navigate, redirectTarget])

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        if (data.session) {
          proceedToTarget(redirectTarget)
        } else {
          setSuccessMsg('Account created! Please check your email inbox to verify.')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        proceedToTarget(redirectTarget)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address first.')
      return
    }
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const siteUrl = window.location.origin
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${siteUrl}${redirectTarget}`,
        },
      })
      if (error) throw error
      setShowOtpInput(true)
      setSuccessMsg(`Verification code sent to ${email}. Check your inbox for the 6-digit code or sign-in link.`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch verification code.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpCode || otpCode.trim().length < 6) {
      setErrorMsg('Please enter the 6-digit code from your email.')
      return
    }
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode.trim(),
        type: 'email',
      })
      if (error) throw error
      if (data.session) {
        proceedToTarget(redirectTarget)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-[#1E2124]">
      <div className="w-full max-w-sm p-6 rounded bg-[#272A2D] border border-[#3B3E42]">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded bg-[#88C0A4] text-[#1E2124] font-black text-base flex items-center justify-center mx-auto mb-3">
            W
          </div>
          <h1 className="text-xl font-bold text-[#F8FAFC]">
            {isSignUp ? 'Create your account' : 'Sign in to Waycord'}
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Access your sync settings and billing dashboard
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded bg-[#FF5252]/10 border border-[#FF5252]/30 text-[#FF5252] text-xs">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded bg-[#88C0A4]/10 border border-[#88C0A4]/30 text-[#88C0A4] text-xs">
            {successMsg}
          </div>
        )}

        {showOtpInput ? (
          <form onSubmit={handleVerifyOtp} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#F8FAFC]">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => setShowOtpInput(false)}
                  className="text-[10px] text-[#88C0A4] hover:underline"
                >
                  Change Email
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoFocus
                className="w-full px-3 py-2.5 rounded bg-[#1E2124] border border-[#3B3E42] text-[#F8FAFC] placeholder-[#94A3B8]/40 text-center tracking-[0.5em] text-lg font-mono focus:outline-none focus:border-[#88C0A4] transition"
              />
              <p className="text-[10px] text-[#94A3B8] mt-1.5 text-center">
                Enter the code sent to <span className="text-[#F8FAFC] font-mono">{email}</span> or click the magic link in your email.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full py-2.5 rounded bg-[#88C0A4] hover:bg-[#9ECBB5] disabled:opacity-50 text-[#1E2124] font-bold text-xs transition active:scale-95"
            >
              {loading ? 'Verifying...' : 'Verify Code & Sign In'}
            </button>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-1.5 text-center text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition"
            >
              Resend Code
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handlePasswordAuth} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-3 py-2 rounded bg-[#1E2124] border border-[#3B3E42] text-[#F8FAFC] placeholder-[#94A3B8]/60 text-xs focus:outline-none focus:border-[#88C0A4] transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F8FAFC] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded bg-[#1E2124] border border-[#3B3E42] text-[#F8FAFC] placeholder-[#94A3B8]/60 text-xs focus:outline-none focus:border-[#88C0A4] transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded bg-[#88C0A4] hover:bg-[#9ECBB5] disabled:opacity-50 text-[#1E2124] font-bold text-xs transition active:scale-95"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In with Password'}
              </button>
            </form>

            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#3B3E42]"></div>
              </div>
              <span className="relative bg-[#272A2D] px-2 font-mono text-[10px] uppercase text-[#94A3B8]">
                or passwordless
              </span>
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-2 rounded bg-transparent border border-[#3B3E42] hover:border-[#94A3B8] text-[#94A3B8] hover:text-[#F8FAFC] text-xs font-medium transition"
            >
              Send 6-Digit OTP / Login Link
            </button>
          </>
        )}

        <div className="mt-6 pt-4 border-t border-[#3B3E42] text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setErrorMsg(null)
              setSuccessMsg(null)
            }}
            className="text-xs text-[#94A3B8] hover:text-[#88C0A4] transition"
          >
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account yet? Create one"}
          </button>
        </div>
      </div>
    </div>
  )
}
