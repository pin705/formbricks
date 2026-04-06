import { Suspense } from 'react'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import PageContainer from '@/components/layout/page-container'
import { workspaceAnalyticsOptions } from '@/features/analytics/api/queries'
import { linksQueryOptions } from '@/features/links/api/queries'
import { OverviewClient } from '@/features/overview/components/overview-client'
import { CreateLinkTrigger } from '@/features/links/components/create-link-trigger'
import { Skeleton } from '@/components/ui/skeleton'
import { getWorkspace } from '@/lib/workspace'

export const metadata = { title: 'Overview' }

export default async function OverviewPage() {
  const workspace = await getWorkspace()
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(workspaceAnalyticsOptions('30d'))
  void queryClient.prefetchQuery(linksQueryOptions({ page: 1, limit: 5 }))

  return (
    <PageContainer
      scrollable
      pageTitle={`Welcome to ${workspace.name}`}
      pageDescription="Here's what's happening with your links."
      pageHeaderAction={<CreateLinkTrigger />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <div className='space-y-6'>
              <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className='h-24 rounded-xl' />
                ))}
              </div>
              <Skeleton className='h-56 rounded-xl' />
              <Skeleton className='h-48 rounded-xl' />
            </div>
          }
        >
          <OverviewClient workspaceName={workspace.name} />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  )
}
