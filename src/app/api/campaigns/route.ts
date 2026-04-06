import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { listCampaigns, createCampaign } from '@/features/campaigns/api/service'
import { createCampaignSchema } from '@/features/campaigns/schemas/campaign'

export async function GET() {
  const { orgId } = await auth()
  if (!orgId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await listCampaigns(orgId)
  return Response.json(result)
}

export async function POST(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createCampaignSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 })
  }

  const campaign = await createCampaign(parsed.data, orgId)
  return Response.json({ campaign }, { status: 201 })
}
