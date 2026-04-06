import { queryOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { LinkAnalytics, WorkspaceAnalytics, TimeRange } from './types'

export const analyticsKeys = {
  all: ['analytics'] as const,
  workspace: (range: TimeRange) => [...analyticsKeys.all, 'workspace', range] as const,
  link: (linkId: string, range: TimeRange) => [...analyticsKeys.all, 'link', linkId, range] as const
}

export const workspaceAnalyticsOptions = (range: TimeRange) =>
  queryOptions({
    queryKey: analyticsKeys.workspace(range),
    queryFn: () =>
      apiClient<WorkspaceAnalytics>(`/analytics/workspace?range=${range}`)
  })

export const linkAnalyticsOptions = (linkId: string, range: TimeRange) =>
  queryOptions({
    queryKey: analyticsKeys.link(linkId, range),
    queryFn: () =>
      apiClient<LinkAnalytics>(`/analytics/link/${linkId}?range=${range}`),
    enabled: !!linkId
  })
