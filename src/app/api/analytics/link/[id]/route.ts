import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { getLinkById } from '@/features/links/api/service'
import { getLinkAnalytics } from '@/features/analytics/api/service'
import type { TimeRange } from '@/features/analytics/api/types'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { orgId } = await auth()
  if (!orgId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const link = await getLinkById(id, orgId)
  if (!link) return Response.json({ error: 'Not found' }, { status: 404 })
  if (!link.dubLinkId) return Response.json({ error: 'No analytics available' }, { status: 404 })

  const range = (req.nextUrl.searchParams.get('range') ?? '30d') as TimeRange
  const data = await getLinkAnalytics(link.dubLinkId, range)
  return Response.json(data)
}
