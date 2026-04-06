import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { DomainsResponse } from './types'

export const domainKeys = {
  all: ['domains'] as const,
  list: () => [...domainKeys.all, 'list'] as const
}

export const domainsQueryOptions = () =>
  queryOptions({
    queryKey: domainKeys.list(),
    queryFn: () => apiClient<DomainsResponse>('/domains')
  })
