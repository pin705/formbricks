import { getApiContext } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { getCurrentPeriod } from '@/lib/workspace'

export async function GET() {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const period = getCurrentPeriod()

  const [counter, workspace, totalLinks, totalDomains] = await Promise.all([
    db.usageCounter.findUnique({
      where: { workspaceId_period: { workspaceId: ctx.workspaceId, period } }
    }),
    db.workspace.findUnique({
      where: { id: ctx.workspaceId },
      include: { subscription: { include: { plan: true } } }
    }),
    db.link.count({ where: { workspaceId: ctx.workspaceId } }),
    db.domain.count({ where: { workspaceId: ctx.workspaceId } })
  ])

  const plan = workspace?.subscription?.plan

  return Response.json({
    period,
    plan: plan
      ? {
          name: plan.name,
          maxLinks: plan.maxLinks,
          maxDomains: plan.maxDomains,
          maxMembers: plan.maxMembers,
          maxClicksPerMonth: plan.maxClicksPerMonth,
          analyticsRetentionDays: plan.analyticsRetentionDays
        }
      : null,
    usage: {
      linksCreatedThisPeriod: counter?.linksCreated ?? 0,
      domainsAdded: totalDomains,
      totalLinks
    }
  })
}
