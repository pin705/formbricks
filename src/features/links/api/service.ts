import { db } from '@/lib/db'
import { dub } from '@/lib/dub'
import type { CreateLinkInput, UpdateLinkInput, LinkFilters, LinksResponse, Link } from './types'
import type { Prisma } from '@prisma/client'

// ─── List ──────────────────────────────────────────────────
export async function listLinks(workspaceId: string, filters: LinkFilters): Promise<LinksResponse> {
  const page = filters.page ?? 1
  const limit = filters.limit ?? 20

  const where: Prisma.LinkWhereInput = {
    workspaceId,
    ...(filters.search
      ? {
          OR: [
            { slug: { contains: filters.search, mode: 'insensitive' } },
            { destinationUrl: { contains: filters.search, mode: 'insensitive' } },
            { title: { contains: filters.search, mode: 'insensitive' } }
          ]
        }
      : {}),
    ...(filters.campaignId ? { campaignId: filters.campaignId } : {}),
    ...(filters.isActive !== undefined ? { isActive: filters.isActive } : {})
  }

  const [links, total] = await Promise.all([
    db.link.findMany({
      where,
      include: {
        campaign: { select: { id: true, name: true, color: true } },
        domain: { select: { id: true, hostname: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    db.link.count({ where })
  ])

  return {
    links: links as Link[],
    total,
    page,
    limit,
    pageCount: Math.ceil(total / limit)
  }
}

// ─── Get by ID ────────────────────────────────────────────
export async function getLinkById(id: string, workspaceId: string): Promise<Link | null> {
  const link = await db.link.findFirst({
    where: { id, workspaceId },
    include: {
      campaign: { select: { id: true, name: true, color: true } },
      domain: { select: { id: true, hostname: true } }
    }
  })
  return link as Link | null
}

// ─── Create ───────────────────────────────────────────────
export async function createLink(
  input: CreateLinkInput,
  workspaceId: string,
  userId: string
): Promise<Link> {
  const domain = input.domainId
    ? await db.domain.findFirst({ where: { id: input.domainId, workspaceId } })
    : null

  // Create in Dub
  const dubLink = await dub.links.create({
    url: input.destinationUrl,
    ...(input.slug ? { key: input.slug } : {}),
    ...(domain ? { domain: domain.hostname } : {}),
    ...(input.title ? { title: input.title } : {})
  })

  const link = await db.link.create({
    data: {
      workspaceId,
      createdByUserId: userId,
      destinationUrl: input.destinationUrl,
      slug: dubLink.key,
      dubLinkId: dubLink.id,
      shortUrl: dubLink.shortLink,
      title: input.title ?? dubLink.title ?? null,
      isActive: true,
      ...(input.campaignId ? { campaignId: input.campaignId } : {}),
      ...(input.domainId ? { domainId: input.domainId } : {}),
      ...(input.expiresAt ? { expiresAt: new Date(input.expiresAt) } : {})
    },
    include: {
      campaign: { select: { id: true, name: true, color: true } },
      domain: { select: { id: true, hostname: true } }
    }
  })

  return link as Link
}

// ─── Update ───────────────────────────────────────────────
export async function updateLink(
  id: string,
  input: UpdateLinkInput,
  workspaceId: string
): Promise<Link> {
  const existing = await db.link.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new Error('Link not found')

  if (existing.dubLinkId) {
    await dub.links.update(existing.dubLinkId, {
      ...(input.destinationUrl ? { url: input.destinationUrl } : {}),
      ...(input.title !== undefined ? { title: input.title ?? undefined } : {})
    })
  }

  const link = await db.link.update({
    where: { id },
    data: {
      ...(input.destinationUrl ? { destinationUrl: input.destinationUrl } : {}),
      ...(input.title !== undefined ? { title: input.title || null } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.campaignId !== undefined ? { campaignId: input.campaignId || null } : {}),
      ...(input.expiresAt !== undefined
        ? { expiresAt: input.expiresAt ? new Date(input.expiresAt) : null }
        : {})
    },
    include: {
      campaign: { select: { id: true, name: true, color: true } },
      domain: { select: { id: true, hostname: true } }
    }
  })

  return link as Link
}

// ─── Delete ───────────────────────────────────────────────
export async function deleteLink(id: string, workspaceId: string): Promise<void> {
  const existing = await db.link.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new Error('Link not found')

  if (existing.dubLinkId) {
    await dub.links.delete(existing.dubLinkId)
  }

  await db.link.delete({ where: { id } })
}

// ─── Slug availability check ──────────────────────────────
export async function checkSlugAvailable(
  slug: string,
  workspaceId: string,
  excludeLinkId?: string
): Promise<boolean> {
  const existing = await db.link.findFirst({
    where: {
      slug,
      workspaceId,
      ...(excludeLinkId ? { id: { not: excludeLinkId } } : {})
    }
  })
  return !existing
}
