import { getApiContext } from '@/lib/api-auth'
import { NextRequest } from 'next/server'
import { setPrimaryDomain } from '@/features/domains/api/service'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await setPrimaryDomain(id, ctx.workspaceId)
  return Response.json({ ok: true })
}
