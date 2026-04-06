import { createServerClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { NextRequest } from 'next/server'
import * as z from 'zod'

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens')
})

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const memberships = await db.workspaceMember.findMany({
    where: { userId: user.id },
    include: { workspace: true },
    orderBy: { createdAt: 'asc' }
  })

  const workspaces = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    role: m.role
  }))

  return Response.json({ workspaces })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createWorkspaceSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 })
  }

  const { name, slug } = parsed.data

  const existing = await db.workspace.findUnique({ where: { slug } })
  if (existing) {
    return Response.json({ error: 'Slug already taken' }, { status: 409 })
  }

  const workspace = await db.workspace.create({
    data: {
      name,
      slug,
      ownerId: user.id,
      members: {
        create: { userId: user.id, role: 'owner' }
      }
    }
  })

  return Response.json({ workspace }, { status: 201 })
}
