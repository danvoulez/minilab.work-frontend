'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/auth/update-password`,
    })

    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center px-4">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 w-full max-w-[340px]">
        <div className="mb-8 text-center">
          <p className="text-base font-black tracking-tight text-white">minilab.work</p>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 text-center space-y-2">
            <p className="text-sm font-semibold text-white">Check your email</p>
            <p className="text-xs text-white/40 leading-relaxed">
              A reset link was sent to <span className="text-white/65">{email}</span>.
            </p>
            <Link
              href="/login"
              className="block mt-3 text-[11px] text-white/30 hover:text-white/55 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">Reset your password</p>
              <p className="text-[11px] text-white/35">We'll send a reset link to your email.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 focus:bg-white/[0.06] transition-colors"
              />
            </div>

            {error && <p className="text-[11px] text-red-400/80">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white py-2.5 text-sm font-bold text-[#0e0e0e] hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>

            <Link
              href="/login"
              className="block text-center text-[11px] text-white/25 hover:text-white/50 transition-colors"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
