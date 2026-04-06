export type Domain = {
  id: string
  workspaceId: string
  hostname: string
  dubDomainId: string | null
  isVerified: boolean
  isPrimary: boolean
  createdAt: Date
}

export type CreateDomainInput = {
  hostname: string
}

export type DomainsResponse = {
  domains: Domain[]
  total: number
}
