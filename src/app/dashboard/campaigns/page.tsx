import { Suspense } from 'react'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import PageContainer from '@/components/layout/page-container'
import { campaignsQueryOptions } from '@/features/campaigns/api/queries'
import { CampaignListing } from '@/features/campaigns/components/campaign-listing'
import { CreateCampaignDialog } from '@/features/campaigns/components/create-campaign-dialog'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: 'Campaigns' }

export default async function CampaignsPage() {
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(campaignsQueryOptions())

  return (
    <PageContainer
      scrollable
      pageTitle='Campaigns'
      pageDescription='Group your links into campaigns to compare performance.'
      pageHeaderAction={<CreateCampaignDialog />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className='h-28 rounded-xl' />
              ))}
            </div>
          }
        >
          <CampaignListing />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  )
}
