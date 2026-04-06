import { apiClient } from '@/lib/api-client'
import { domainKeys } from './queries'
import type { Domain } from './types'

export const addDomainMutation = {
  mutationFn: (hostname: string) =>
    apiClient<{ domain: Domain }>('/domains', {
      method: 'POST',
      body: JSON.stringify({ hostname })
    }),
  invalidates: [domainKeys.list()]
}

export const verifyDomainMutation = {
  mutationFn: (id: string) =>
    apiClient<{ domain: Domain }>(`/domains/${id}/verify`, { method: 'POST' }),
  invalidates: [domainKeys.list()]
}

export const setPrimaryDomainMutation = {
  mutationFn: (id: string) =>
    apiClient<{ ok: boolean }>(`/domains/${id}/primary`, { method: 'POST' }),
  invalidates: [domainKeys.list()]
}

export const deleteDomainMutation = {
  mutationFn: (id: string) =>
    apiClient<{ ok: boolean }>(`/domains/${id}`, { method: 'DELETE' }),
  invalidates: [domainKeys.list()]
}
