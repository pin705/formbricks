import { Suspense } from 'react'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import PageContainer from '@/components/layout/page-container'
import { domainsQueryOptions } from '@/features/domains/api/queries'
import { DomainListing } from '@/features/domains/components/domain-listing'
import { AddDomainDialog } from '@/features/domains/components/add-domain-dialog'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: 'Domains' }

export default async function DomainsPage() {
  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(domainsQueryOptions())

  return (
    <PageContainer
      scrollable
      pageTitle='Custom Domains'
      pageDescription='Add your own domain to create branded short links.'
      pageHeaderAction={<AddDomainDialog />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense
          fallback={
            <div className='space-y-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className='h-16 rounded-lg' />
              ))}
            </div>
          }
        >
          <DomainListing />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  )
}
