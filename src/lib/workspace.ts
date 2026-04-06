import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from './db'

export type WorkspaceWithPlan = NonNullable<Awaited<ReturnType<typeof getWorkspace>>>

export async function getWorkspace() {
  const { orgId } = await auth()
  if (!orgId) redirect('/onboarding')

  const workspace = await db.workspace.findUnique({
    where: { id: orgId },
    include: {
      subscription: { include: { plan: true } }
    }
  })

  if (!workspace) redirect('/onboarding')

  return workspace
}

export async function getWorkspaceOrNull() {
  const { orgId } = await auth()
  if (!orgId) return null

  return db.workspace.findUnique({
    where: { id: orgId },
    include: {
      subscription: { include: { plan: true } }
    }
  })
}

export function getCurrentPeriod() {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
