import { auth } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { createLink, listLinks, checkSlugAvailable } from '@/features/links/api/service'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { createLinkSchema } from '@/features/links/schemas/link'

export async function GET(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const filters = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    search: searchParams.get('search') ?? undefined,
    campaignId: searchParams.get('campaignId') ?? undefined
  }

  const result = await listLinks(orgId, filters)
  return Response.json(result)
}

export async function POST(req: NextRequest) {
  const { orgId, userId } = await auth()
  if (!orgId || !userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createLinkSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 })
  }

  const limitCheck = await checkUsageLimit(orgId, 'links')
  if (!limitCheck.allowed) {
    return Response.json(
      { error: 'LIMIT_EXCEEDED', ...limitCheck },
      { status: 402 }
    )
  }

  const { slug, ...rest } = parsed.data
  const input = {
    ...rest,
    ...(slug ? { slug } : {})
  }

  const link = await createLink(input, orgId, userId)
  await incrementUsage(orgId, 'links')

  return Response.json({ link }, { status: 201 })
}

// Slug availability check — GET /api/links/slug-check?slug=xyz
export async function HEAD(req: NextRequest) {
  const { orgId } = await auth()
  if (!orgId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const slug = req.nextUrl.searchParams.get('slug') ?? ''
  const available = await checkSlugAvailable(slug, orgId)
  return Response.json({ available })
}
