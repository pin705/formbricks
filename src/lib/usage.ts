import { db } from './db'
import { getCurrentPeriod } from './workspace'

export type UsageResource = 'links' | 'domains'

export type LimitCheckResult =
  | { allowed: true }
  | { allowed: false; current: number; max: number; upgradeUrl: string }

export async function checkUsageLimit(
  workspaceId: string,
  resource: UsageResource
): Promise<LimitCheckResult> {
  const period = getCurrentPeriod()

  const [counter, workspace] = await Promise.all([
    db.usageCounter.findUnique({
      where: { workspaceId_period: { workspaceId, period } }
    }),
    db.workspace.findUnique({
      where: { id: workspaceId },
      include: { subscription: { include: { plan: true } } }
    })
  ])

  const plan = workspace?.subscription?.plan
  if (!plan) return { allowed: true } // no plan record = allow (edge case during setup)

  const current =
    resource === 'links' ? (counter?.linksCreated ?? 0) : (counter?.domainsAdded ?? 0)

  const max = resource === 'links' ? plan.maxLinks : plan.maxDomains

  if (current >= max) {
    return {
      allowed: false,
      current,
      max,
      upgradeUrl: '/dashboard/billing'
    }
  }

  return { allowed: true }
}

export async function incrementUsage(workspaceId: string, resource: UsageResource) {
  const period = getCurrentPeriod()

  await db.usageCounter.upsert({
    where: { workspaceId_period: { workspaceId, period } },
    update:
      resource === 'links'
        ? { linksCreated: { increment: 1 } }
        : { domainsAdded: { increment: 1 } },
    create: {
      workspaceId,
      period,
      linksCreated: resource === 'links' ? 1 : 0,
      domainsAdded: resource === 'domains' ? 1 : 0
    }
  })
}

export async function decrementUsage(workspaceId: string, resource: UsageResource) {
  const period = getCurrentPeriod()

  const counter = await db.usageCounter.findUnique({
    where: { workspaceId_period: { workspaceId, period } }
  })
  if (!counter) return

  await db.usageCounter.update({
    where: { workspaceId_period: { workspaceId, period } },
    data:
      resource === 'links'
        ? { linksCreated: Math.max(0, counter.linksCreated - 1) }
        : { domainsAdded: Math.max(0, counter.domainsAdded - 1) }
  })
}
