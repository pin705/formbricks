import { Suspense } from 'react'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/query-client'
import PageContainer from '@/components/layout/page-container'
import { linksQueryOptions } from '@/features/links/api/queries'
import { LinksTable } from '@/features/links/components/link-table'
import { CreateLinkTrigger } from '@/features/links/components/create-link-trigger'
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton'
import { SearchParams } from 'nuqs/server'

export const metadata = { title: 'Links' }

type PageProps = { searchParams: Promise<SearchParams> }

export default async function LinksPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const page = Number(sp['page'] ?? 1)
  const limit = Number(sp['perPage'] ?? 20)
  const search = typeof sp['search'] === 'string' ? sp['search'] : undefined
  const campaignId = typeof sp['campaignId'] === 'string' ? sp['campaignId'] : undefined

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(linksQueryOptions({ page, limit, search, campaignId }))

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Links'
      pageDescription='Create, manage, and track all your short links.'
      pageHeaderAction={<CreateLinkTrigger />}
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={10} />}>
          <LinksTable />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  )
}
