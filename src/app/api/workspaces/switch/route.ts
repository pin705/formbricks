import { getApiContext } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { workspaceId } = await req.json()
  if (!workspaceId) return Response.json({ error: 'workspaceId required' }, { status: 400 })

  // Verify user is a member
  const member = await db.workspaceMember.findFirst({
    where: { userId: ctx.userId, workspaceId }
  })
  if (!member) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const cookieStore = await cookies()
  cookieStore.set('active_workspace_id', workspaceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365 // 1 year
  })

  return Response.json({ ok: true })
}
