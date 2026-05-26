'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else router.push('/')

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

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">New password</p>
            <p className="text-[11px] text-white/35">Choose a strong password for your account.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/25 focus:bg-white/[0.06] transition-colors"
            />
          </div>

          {error && <p className="text-[11px] text-red-400/80">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white py-2.5 text-sm font-bold text-[#0e0e0e] hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}
