import { getApiContext } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function GET() {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const members = await db.workspaceMember.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    orderBy: { createdAt: 'asc' }
  })

  return Response.json({ members })
}
