'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Mode = 'password' | 'magic'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (mode === 'password') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/')
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })
      if (error) setError(error.message)
      else setSent(true)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center px-4">
      {/* Dot-grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 w-full max-w-[340px]">
        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="text-base font-black tracking-tight text-white">minilab.work</p>
          <p className="text-[10px] text-white/25 mt-0.5 font-semibold tracking-[0.15em] uppercase">
            Operational Cockpit
          </p>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-center space-y-2">
            <p className="text-sm font-semibold text-white">Check your email</p>
            <p className="text-xs text-white/40 leading-relaxed">
              A magic link was sent to <span className="text-white/65">{email}</span>.
              Click it to sign in — no password needed.
            </p>
            <button
              onClick={() => { setSent(false); setMode('password') }}
              className="mt-3 text-[11px] text-white/30 hover:text-white/55 transition-colors"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
            {/* Mode toggle */}
            <div className="flex rounded-lg border border-white/[0.07] overflow-hidden text-[11px] font-semibold">
              {(['password', 'magic'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null) }}
                  className={`flex-1 py-1.5 transition-colors ${
                    mode === m
                      ? 'bg-white/10 text-white'
                      : 'text-white/30 hover:text-white/55'
                  }`}
                >
                  {m === 'password' ? 'Password' : 'Magic link'}
                </button>
              ))}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 focus:bg-white/[0.06] transition-colors"
              />
            </div>

            {/* Password (only in password mode) */}
            {mode === 'password' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[10px] text-white/25 hover:text-white/50 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 focus:bg-white/[0.06] transition-colors"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-[11px] text-red-400/80 leading-snug">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-2.5 text-sm font-bold text-[#0e0e0e] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {loading
                ? 'Signing in…'
                : mode === 'password'
                ? 'Sign in'
                : 'Send magic link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
