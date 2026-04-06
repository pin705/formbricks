import { mutationOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { getQueryClient } from '@/lib/query-client'
import { campaignKeys } from './queries'
import { linkKeys } from '@/features/links/api/queries'
import type { CreateCampaignInput, UpdateCampaignInput, Campaign } from './types'

export const createCampaignMutation = mutationOptions({
  mutationFn: (data: CreateCampaignInput) =>
    apiClient<{ campaign: Campaign }>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: campaignKeys.all })
  }
})

export const updateCampaignMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: UpdateCampaignInput }) =>
    apiClient<{ campaign: Campaign }>(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(values)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: campaignKeys.all })
  }
})

export const deleteCampaignMutation = mutationOptions({
  mutationFn: (id: string) =>
    apiClient<{ ok: boolean }>(`/campaigns/${id}`, { method: 'DELETE' }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: campaignKeys.all })
    getQueryClient().invalidateQueries({ queryKey: linkKeys.all })
  }
})
