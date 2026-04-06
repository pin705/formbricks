export type Link = {
  id: string
  workspaceId: string
  domainId: string | null
  campaignId: string | null
  createdByUserId: string
  destinationUrl: string
  slug: string
  dubLinkId: string | null
  shortUrl: string | null
  isActive: boolean
  title: string | null
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
  // joined relations
  campaign?: {
    id: string
    name: string
    color: string
  } | null
  domain?: {
    id: string
    hostname: string
  } | null
}

export type CreateLinkInput = {
  destinationUrl: string
  slug?: string
  campaignId?: string
  domainId?: string
  title?: string
  expiresAt?: string // ISO string
}

export type UpdateLinkInput = Partial<CreateLinkInput> & {
  isActive?: boolean
}

export type LinkFilters = {
  page?: number
  limit?: number
  search?: string
  campaignId?: string
  isActive?: boolean
  sort?: string
}

export type LinksResponse = {
  links: Link[]
  total: number
  page: number
  limit: number
  pageCount: number
}
