import { redirect } from 'next/navigation'
import { getWorkspaceOrNull, getSupabaseUser } from '@/lib/workspace'
import { db } from '@/lib/db'
import PlanSelectionClient from './plan-selection-client'

export default async function SelectPlanPage() {
  const user = await getSupabaseUser()
  if (!user) redirect('/auth/sign-in')

  const workspace = await getWorkspaceOrNull()
  if (!workspace) redirect('/onboarding/workspace')

  const plans = await db.plan.findMany({ orderBy: { maxLinks: 'asc' } })

  return <PlanSelectionClient workspace={workspace} plans={plans} />
}
