import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

type OrganizationCreatedEvent = {
  type: 'organization.created'
  data: {
    id: string
    name: string
    slug: string | null
  }
}

type OrganizationUpdatedEvent = {
  type: 'organization.updated'
  data: {
    id: string
    name: string
    slug: string | null
  }
}

type ClerkWebhookEvent = OrganizationCreatedEvent | OrganizationUpdatedEvent

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return Response.json({ error: 'No webhook secret configured' }, { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await req.text()
  const wh = new Webhook(WEBHOOK_SECRET)

  let event: ClerkWebhookEvent
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature
    }) as ClerkWebhookEvent
  } catch {
    return Response.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  if (event.type === 'organization.created') {
    const { id, name, slug } = event.data

    const freePlan = await db.plan.findUnique({ where: { name: 'free' } })
    if (!freePlan) {
      return Response.json({ error: 'Free plan not seeded' }, { status: 500 })
    }

    const workspaceSlug = slug ?? id

    await db.workspace.upsert({
      where: { id },
      update: { name, slug: workspaceSlug },
      create: { id, name, slug: workspaceSlug }
    })

    const now = new Date()
    const nextMonth = new Date(now)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    await db.subscription.upsert({
      where: { workspaceId: id },
      update: {},
      create: {
        workspaceId: id,
        planId: freePlan.id,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth
      }
    })

    const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
    await db.usageCounter.upsert({
      where: { workspaceId_period: { workspaceId: id, period } },
      update: {},
      create: { workspaceId: id, period }
    })
  }

  if (event.type === 'organization.updated') {
    const { id, name, slug } = event.data
    await db.workspace.updateMany({
      where: { id },
      data: { name, ...(slug ? { slug } : {}) }
    })
  }

  return Response.json({ ok: true })
}
