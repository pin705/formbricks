import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { getLinkById, updateLink, deleteLink } from '@/features/links/api/service'
import { decrementUsage } from '@/lib/usage'
import { updateLinkSchema } from '@/features/links/schemas/link'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { orgId } = await auth()
  if (!orgId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const link = await getLinkById(id, orgId)
  if (!link) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({ link })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { orgId } = await auth()
  if (!orgId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const parsed = updateLinkSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 })
  }

  const { slug, ...rest } = parsed.data
  const input = { ...rest, ...(slug ? { slug } : {}) }

  const link = await updateLink(id, input, orgId)
  return Response.json({ link })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { orgId } = await auth()
  if (!orgId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await deleteLink(id, orgId)
  await decrementUsage(orgId, 'links')

  return Response.json({ ok: true })
}
