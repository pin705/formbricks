import { getApiContext } from '@/lib/api-auth'
import { NextRequest } from 'next/server'
import { createLink, listLinks } from '@/features/links/api/service'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { createLinkSchema } from '@/features/links/schemas/link'

export async function GET(req: NextRequest) {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const filters = {
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
    search: searchParams.get('search') ?? undefined,
    campaignId: searchParams.get('campaignId') ?? undefined
  }

  const result = await listLinks(ctx.workspaceId, filters)
  return Response.json(result)
}

export async function POST(req: NextRequest) {
  const ctx = await getApiContext()
  if (!ctx) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = createLinkSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 422 })
  }

  const limitCheck = await checkUsageLimit(ctx.workspaceId, 'links')
  if (!limitCheck.allowed) {
    return Response.json({ error: 'LIMIT_EXCEEDED', ...limitCheck }, { status: 402 })
  }

  const { slug, ...rest } = parsed.data
  const input = { ...rest, ...(slug ? { slug } : {}) }

  const link = await createLink(input, ctx.workspaceId, ctx.userId)
  await incrementUsage(ctx.workspaceId, 'links')

  return Response.json({ link }, { status: 201 })
}
