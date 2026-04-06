import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { Link, LinkFilters, LinksResponse } from './types'

export type { Link }

export const linkKeys = {
  all: ['links'] as const,
  list: (filters: LinkFilters) => [...linkKeys.all, 'list', filters] as const,
  detail: (id: string) => [...linkKeys.all, 'detail', id] as const,
  slugCheck: (slug: string) => [...linkKeys.all, 'slug-check', slug] as const
}

export const linksQueryOptions = (filters: LinkFilters) =>
  queryOptions({
    queryKey: linkKeys.list(filters),
    queryFn: () => {
      const params = new URLSearchParams()
      if (filters.page) params.set('page', String(filters.page))
      if (filters.limit) params.set('limit', String(filters.limit))
      if (filters.search) params.set('search', filters.search)
      if (filters.campaignId) params.set('campaignId', filters.campaignId)
      return apiClient<LinksResponse>(`/links?${params.toString()}`)
    }
  })

export const linkByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: linkKeys.detail(id),
    queryFn: () => apiClient<{ link: Link }>(`/links/${id}`)
  })

export const slugCheckQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: linkKeys.slugCheck(slug),
    queryFn: () => apiClient<{ available: boolean }>(`/links/slug-check?slug=${slug}`),
    enabled: slug.length >= 2
  })
