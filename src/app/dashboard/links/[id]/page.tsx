import { Suspense } from 'react'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { getQueryClient } from '@/lib/query-client'
import PageContainer from '@/components/layout/page-container'
import { linkAnalyticsOptions } from '@/features/analytics/api/queries'
import { getLinkById } from '@/features/links/api/service'
import { getWorkspace } from '@/lib/workspace'
import { LinkAnalyticsView } from '@/features/analytics/components/link-analytics-view'
import { TimeRangeTabs } from '@/features/analytics/components/time-range-tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import Link from 'next/link'
import { SearchParams } from 'nuqs/server'
import type { TimeRange } from '@/features/analytics/api/types'

export const metadata = { title: 'Link Analytics' }

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}

export default async function LinkAnalyticsPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const sp = await searchParams
  const range = (sp['range'] ?? '30d') as TimeRange

  const workspace = await getWorkspace()
  const link = await getLinkById(id, workspace.id)
  if (!link) notFound()

  const queryClient = getQueryClient()
  if (link.dubLinkId) {
    void queryClient.prefetchQuery(linkAnalyticsOptions(id, range))
  }

  const shortUrl = link.shortUrl ?? `/${link.slug}`
  const displayUrl = shortUrl.replace(/^https?:\/\//, '')

  return (
    <PageContainer
      scrollable
      pageTitle={displayUrl}
      pageDescription={link.destinationUrl}
      pageHeaderAction={
        <div className='flex items-center gap-2'>
          <TimeRangeTabs />
          <Button variant='outline' size='sm' asChild>
            <Link href='/dashboard/links'>
              <Icons.chevronLeft className='mr-1 h-4 w-4' />
              Back
            </Link>
          </Button>
        </div>
      }
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <div className='space-y-4'>
              <div className='grid gap-4 grid-cols-2 md:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className='h-24 rounded-xl' />
                ))}
              </div>
              <Skeleton className='h-56 rounded-xl' />
            </div>
          }
        >
          {link.dubLinkId ? (
            <LinkAnalyticsView linkId={id} />
          ) : (
            <div className='flex flex-col items-center justify-center gap-3 py-24 text-center'>
              <Icons.trendingUp className='h-10 w-10 text-muted-foreground' />
              <p className='font-semibold'>No analytics available</p>
              <p className='text-muted-foreground text-sm'>
                This link was not tracked. Create new links to see analytics.
              </p>
            </div>
          )}
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  )
}
