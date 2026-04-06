import { mutationOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { getQueryClient } from '@/lib/query-client'
import { linkKeys } from './queries'
import type { CreateLinkInput, UpdateLinkInput, Link } from './types'

export const createLinkMutation = mutationOptions({
  mutationFn: (data: CreateLinkInput) =>
    apiClient<{ link: Link }>('/links', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: linkKeys.all })
  }
})

export const updateLinkMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: UpdateLinkInput }) =>
    apiClient<{ link: Link }>(`/links/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(values)
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: linkKeys.all })
  }
})

export const deleteLinkMutation = mutationOptions({
  mutationFn: (id: string) =>
    apiClient<{ ok: boolean }>(`/links/${id}`, { method: 'DELETE' }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: linkKeys.all })
  }
})

export const toggleLinkMutation = mutationOptions({
  mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
    apiClient<{ link: Link }>(`/links/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive })
    }),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: linkKeys.all })
  }
})
