import { getApiContext } from '@/lib/api-auth'
import { NextRequest } from 'next/server'
import { getWorkspaceAnalytics } from '@/features/analytics/api/service'
import type { TimeRange } from '@/features/analytics/api/types'

export async function GET(req: NextRequest) {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const range = (req.nextUrl.searchParams.get('range') ?? '30d') as TimeRange
  const data = await getWorkspaceAnalytics(ctx.workspaceId, range)
  return Response.json(data)
}
