import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { getCampaignById, updateCampaign, deleteCampaign } from '@/features/campaigns/api/service'
import { createCampaignSchema } from '@/features/campaigns/schemas/campaign'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { orgId } = await auth()
  if (!orgId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const campaign = await getCampaignById(id, orgId)
  if (!campaign) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({ campaign })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { orgId } = await auth()
  if (!orgId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const parsed = createCampaignSchema.partial().safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 })
  }

  const campaign = await updateCampaign(id, parsed.data, orgId)
  return Response.json({ campaign })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { orgId } = await auth()
  if (!orgId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await deleteCampaign(id, orgId)
  return Response.json({ ok: true })
}
