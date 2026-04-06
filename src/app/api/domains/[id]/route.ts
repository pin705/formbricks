import { getApiContext } from '@/lib/api-auth'
import { NextRequest } from 'next/server'
import { deleteDomain } from '@/features/domains/api/service'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await deleteDomain(id, ctx.workspaceId)
    return Response.json({ ok: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed'
    return Response.json({ error: message }, { status: 404 })
  }
}
