import { createServerClient } from '@/lib/supabase/server'
import { ensureUserRecord } from '@/lib/workspace'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard/links'

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (user) {
        // Upsert user in our DB
        await ensureUserRecord(user)

        // Check if user has any workspace
        const membership = await db.workspaceMember.findFirst({
          where: { userId: user.id }
        })

        if (!membership) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/sign-in?error=auth_callback_failed`)
}
