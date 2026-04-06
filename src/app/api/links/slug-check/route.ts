import { getApiContext } from '@/lib/api-auth'
import { NextRequest } from 'next/server'
import { checkSlugAvailable } from '@/features/links/api/service'

export async function GET(req: NextRequest) {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const slug = req.nextUrl.searchParams.get('slug') ?? ''
  if (!slug) return Response.json({ available: false })

  const available = await checkSlugAvailable(slug, ctx.workspaceId)
  return Response.json({ available })
}
