import { getApiContext } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

type Params = { params: Promise<{ userId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const actor = await db.workspaceMember.findFirst({
    where: { workspaceId: ctx.workspaceId, userId: ctx.userId }
  })
  if (actor?.role !== 'owner' && actor?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await params
  const { role } = await req.json()
  if (!role) return Response.json({ error: 'role required' }, { status: 400 })

  // Can't change owner's role
  const target = await db.workspaceMember.findFirst({
    where: { workspaceId: ctx.workspaceId, userId }
  })
  if (target?.role === 'owner') {
    return Response.json({ error: 'Cannot change owner role' }, { status: 403 })
  }

  const updated = await db.workspaceMember.updateMany({
    where: { workspaceId: ctx.workspaceId, userId },
    data: { role }
  })

  return Response.json({ ok: true, count: updated.count })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const actor = await db.workspaceMember.findFirst({
    where: { workspaceId: ctx.workspaceId, userId: ctx.userId }
  })
  if (actor?.role !== 'owner' && actor?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await params

  // Can't remove owner
  const target = await db.workspaceMember.findFirst({
    where: { workspaceId: ctx.workspaceId, userId }
  })
  if (target?.role === 'owner') {
    return Response.json({ error: 'Cannot remove owner' }, { status: 403 })
  }

  await db.workspaceMember.deleteMany({
    where: { workspaceId: ctx.workspaceId, userId }
  })

  return Response.json({ ok: true })
}
