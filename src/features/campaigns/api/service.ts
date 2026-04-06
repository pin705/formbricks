import { db } from '@/lib/db'
import { dub } from '@/lib/dub'
import type { CreateCampaignInput, UpdateCampaignInput, Campaign, CampaignsResponse } from './types'

const DUB_WORKSPACE_ID = process.env.DUB_WORKSPACE_ID!

export async function listCampaigns(workspaceId: string): Promise<CampaignsResponse> {
  const campaigns = await db.campaign.findMany({
    where: { workspaceId, archivedAt: null },
    include: { _count: { select: { links: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return {
    campaigns: campaigns as Campaign[],
    total: campaigns.length
  }
}

export async function getCampaignById(id: string, workspaceId: string): Promise<Campaign | null> {
  const campaign = await db.campaign.findFirst({
    where: { id, workspaceId },
    include: { _count: { select: { links: true } } }
  })
  return campaign as Campaign | null
}

export async function createCampaign(
  input: CreateCampaignInput,
  workspaceId: string
): Promise<Campaign> {
  // Create a Dub tag to group links
  let dubTagId: string | null = null
  try {
    const tag = await dub.tags.create({
      name: `${workspaceId}:${input.name}`,
      color: 'blue'
    })
    dubTagId = tag.id
  } catch {
    // Tag creation is non-critical — continue without it
  }

  const campaign = await db.campaign.create({
    data: {
      workspaceId,
      name: input.name,
      color: input.color ?? '#6366f1',
      description: input.description ?? null,
      dubTagId
    },
    include: { _count: { select: { links: true } } }
  })

  return campaign as Campaign
}

export async function updateCampaign(
  id: string,
  input: UpdateCampaignInput,
  workspaceId: string
): Promise<Campaign> {
  const existing = await db.campaign.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new Error('Campaign not found')

  const campaign = await db.campaign.update({
    where: { id },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.color ? { color: input.color } : {}),
      ...(input.description !== undefined ? { description: input.description || null } : {})
    },
    include: { _count: { select: { links: true } } }
  })

  return campaign as Campaign
}

export async function deleteCampaign(id: string, workspaceId: string): Promise<void> {
  const existing = await db.campaign.findFirst({ where: { id, workspaceId } })
  if (!existing) throw new Error('Campaign not found')

  // Nullify links' campaignId so they don't get deleted
  await db.link.updateMany({ where: { campaignId: id }, data: { campaignId: null } })
  await db.campaign.delete({ where: { id } })
}
