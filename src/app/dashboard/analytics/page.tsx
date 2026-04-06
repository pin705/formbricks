import { Suspense } from 'react'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import PageContainer from '@/components/layout/page-container'
import { workspaceAnalyticsOptions } from '@/features/analytics/api/queries'
import { AnalyticsOverview } from '@/features/analytics/components/analytics-overview'
import { TimeRangeTabs } from '@/features/analytics/components/time-range-tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchParams } from 'nuqs/server'
import type { TimeRange } from '@/features/analytics/api/types'

export const metadata = { title: 'Analytics' }

type PageProps = { searchParams: Promise<SearchParams> }

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const range = (sp['range'] ?? '30d') as TimeRange

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(workspaceAnalyticsOptions(range))

  return (
    <PageContainer
      scrollable
      pageTitle='Analytics'
      pageDescription='Track clicks and performance across all your links.'
      pageHeaderAction={<TimeRangeTabs />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <div className='space-y-4'>
              <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className='h-24 rounded-xl' />
                ))}
              </div>
              <Skeleton className='h-64 rounded-xl' />
            </div>
          }
        >
          <AnalyticsOverview />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  )
}
