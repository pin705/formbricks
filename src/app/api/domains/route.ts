import { getApiContext } from '@/lib/api-auth'
import { NextRequest } from 'next/server'
import { listDomains, addDomain } from '@/features/domains/api/service'

export async function GET() {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await listDomains(ctx.workspaceId)
  return Response.json(result)
}

export async function POST(req: NextRequest) {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { hostname } = await req.json()
  if (!hostname) return Response.json({ error: 'hostname required' }, { status: 400 })

  try {
    const domain = await addDomain(hostname, ctx.workspaceId)
    return Response.json({ domain }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add domain'
    return Response.json({ error: message }, { status: 409 })
  }
}
