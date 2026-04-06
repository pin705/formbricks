import { db } from '@/lib/db'
import { dub } from '@/lib/dub'
import type { Domain, DomainsResponse } from './types'

export async function listDomains(workspaceId: string): Promise<DomainsResponse> {
  const domains = await db.domain.findMany({
    where: { workspaceId },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }]
  })
  return { domains: domains as Domain[], total: domains.length }
}

export async function getDomainById(id: string, workspaceId: string): Promise<Domain | null> {
  const domain = await db.domain.findFirst({ where: { id, workspaceId } })
  return domain as Domain | null
}

export async function addDomain(hostname: string, workspaceId: string): Promise<Domain> {
  const cleaned = hostname.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')

  const existing = await db.domain.findUnique({ where: { hostname: cleaned } })
  if (existing) throw new Error('Domain already added')

  let dubDomainId: string | null = null
  try {
    const dubDomain = await dub.domains.create({ slug: cleaned })
    dubDomainId = dubDomain.id
  } catch {
    // Non-critical — domain still saved locally
  }

  const isFirstDomain = (await db.domain.count({ where: { workspaceId } })) === 0

  const domain = await db.domain.create({
    data: {
      workspaceId,
      hostname: cleaned,
      dubDomainId,
      isPrimary: isFirstDomain
    }
  })

  return domain as Domain
}

export async function verifyDomain(id: string, workspaceId: string): Promise<Domain> {
  const domain = await db.domain.findFirst({ where: { id, workspaceId } })
  if (!domain) throw new Error('Domain not found')

  let isVerified = domain.isVerified

  if (domain.dubDomainId && !isVerified) {
    try {
      const status = await dub.domains.get({ slug: domain.hostname })
      isVerified = status.verified ?? false
    } catch {
      // leave as-is
    }
  }

  const updated = await db.domain.update({
    where: { id },
    data: { isVerified }
  })

  return updated as Domain
}

export async function setPrimaryDomain(id: string, workspaceId: string): Promise<void> {
  await db.$transaction([
    db.domain.updateMany({ where: { workspaceId }, data: { isPrimary: false } }),
    db.domain.update({ where: { id }, data: { isPrimary: true } })
  ])
}

export async function deleteDomain(id: string, workspaceId: string): Promise<void> {
  const domain = await db.domain.findFirst({ where: { id, workspaceId } })
  if (!domain) throw new Error('Domain not found')

  if (domain.dubDomainId) {
    try {
      await dub.domains.delete({ slug: domain.hostname })
    } catch {
      // best-effort
    }
  }

  // Nullify links using this domain
  await db.link.updateMany({ where: { domainId: id }, data: { domainId: null } })
  await db.domain.delete({ where: { id } })

  // If deleted domain was primary, set next one as primary
  if (domain.isPrimary) {
    const next = await db.domain.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' }
    })
    if (next) await db.domain.update({ where: { id: next.id }, data: { isPrimary: true } })
  }
}
