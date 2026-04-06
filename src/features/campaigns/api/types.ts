export type Campaign = {
  id: string
  workspaceId: string
  name: string
  color: string
  description: string | null
  dubTagId: string | null
  createdAt: Date
  archivedAt: Date | null
  _count?: { links: number }
}

export type CreateCampaignInput = {
  name: string
  color?: string
  description?: string
}

export type UpdateCampaignInput = Partial<CreateCampaignInput>

export type CampaignsResponse = {
  campaigns: Campaign[]
  total: number
}
