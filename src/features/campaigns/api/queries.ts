import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Campaign, CampaignsResponse } from './types'

export type { Campaign }

export const campaignKeys = {
  all: ['campaigns'] as const,
  list: () => [...campaignKeys.all, 'list'] as const,
  detail: (id: string) => [...campaignKeys.all, 'detail', id] as const
}

export const campaignsQueryOptions = () =>
  queryOptions({
    queryKey: campaignKeys.list(),
    queryFn: () => apiClient<CampaignsResponse>('/campaigns')
  })

export const campaignByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: campaignKeys.detail(id),
    queryFn: () => apiClient<{ campaign: Campaign }>(`/campaigns/${id}`)
  })
