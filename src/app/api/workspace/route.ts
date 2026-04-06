import { getApiContext } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import * as z from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  slug: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9-]+$/)
    .optional()
})

export async function GET() {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const workspace = await db.workspace.findUnique({
    where: { id: ctx.workspaceId },
    include: { subscription: { include: { plan: true } } }
  })

  return Response.json({ workspace })
}

export async function PATCH(req: NextRequest) {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Only owners can update workspace
  const member = await db.workspaceMember.findFirst({
    where: { workspaceId: ctx.workspaceId, userId: ctx.userId }
  })
  if (member?.role !== 'owner' && member?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 })
  }

  const { name, slug } = parsed.data

  if (slug) {
    const existing = await db.workspace.findFirst({
      where: { slug, NOT: { id: ctx.workspaceId } }
    })
    if (existing) return Response.json({ error: 'Slug already taken' }, { status: 409 })
  }

  const workspace = await db.workspace.update({
    where: { id: ctx.workspaceId },
    data: {
      ...(name ? { name } : {}),
      ...(slug ? { slug } : {})
    }
  })

  return Response.json({ workspace })
}
