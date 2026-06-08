import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

// Single landing route for every Supabase email auth flow:
//   - PKCE flow (the @supabase/ssr default): link returns ?code=... -> exchangeCodeForSession
//   - token_hash flow (custom email template using {{ .TokenHash }}): ?token_hash=...&type=... -> verifyOtp
// Covers magic-link sign-in, signup email confirmation, and password recovery.
//
// Why both: @supabase/ssr defaults to PKCE, so the stock email templates send users
// back here with ?code=. The previous version only read token_hash, so every link
// fell through to invalid_link and bounced to /login. Handling both makes this work
// whether or not the email templates have been customised.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // Only allow same-origin redirects — never honour an absolute/external `next`.
  const rawNext = searchParams.get('next') ?? '/'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }
    redirect(next)
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (error) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }
    redirect(next)
  }

  redirect('/login?error=invalid_link')
}
