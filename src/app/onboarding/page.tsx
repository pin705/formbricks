import { redirect } from 'next/navigation'
import { getSupabaseUser } from '@/lib/workspace'
import { db } from '@/lib/db'

export default async function OnboardingPage() {
  const user = await getSupabaseUser()
  if (!user) redirect('/auth/sign-in')

  const membership = await db.workspaceMember.findFirst({ where: { userId: user.id } })
  if (membership) redirect('/dashboard/links')

  redirect('/onboarding/workspace')
}
