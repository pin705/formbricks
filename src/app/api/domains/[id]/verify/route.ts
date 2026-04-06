import { getApiContext } from '@/lib/api-auth'
import { NextRequest } from 'next/server'
import { verifyDomain } from '@/features/domains/api/service'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: Params) {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const domain = await verifyDomain(id, ctx.workspaceId)
    return Response.json({ domain })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed'
    return Response.json({ error: message }, { status: 404 })
  }
}
