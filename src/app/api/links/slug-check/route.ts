import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { checkSlugAvailable } from '@/features/links/api/service'

export async function GET(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const slug = req.nextUrl.searchParams.get('slug') ?? ''
  if (!slug) return Response.json({ available: false })

  const available = await checkSlugAvailable(slug, orgId)
  return Response.json({ available })
}
