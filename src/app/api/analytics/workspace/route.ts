import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { getWorkspaceAnalytics } from '@/features/analytics/api/service'
import type { TimeRange } from '@/features/analytics/api/types'

export async function GET(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const range = (req.nextUrl.searchParams.get('range') ?? '30d') as TimeRange
  const data = await getWorkspaceAnalytics(orgId, range)
  return Response.json(data)
}
