import PageContainer from '@/components/layout/page-container'
import { BillingClient } from '@/features/billing/components/billing-client'
import { getQueryClient } from '@/lib/query-client'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { queryOptions } from '@tanstack/react-query'
import { db } from '@/lib/db'
import { getWorkspace } from '@/lib/workspace'

export const metadata = { title: 'Billing' }

const usageQueryOptions = () =>
  queryOptions({
    queryKey: ['workspace', 'usage'],
    queryFn: async () => {
      const res = await fetch('/api/workspace/usage')
      return res.json()
    }
  })

export default async function BillingPage() {
  const workspace = await getWorkspace()

  const plans = await db.plan.findMany({ orderBy: { maxLinks: 'asc' } })

  const queryClient = getQueryClient()

  return (
    <PageContainer scrollable pageTitle='Billing & Plans' pageDescription='Your plan and current usage.'>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <BillingClient
          plans={plans}
          currentPlanId={workspace.subscription?.planId ?? null}
        />
      </HydrationBoundary>
    </PageContainer>
  )
}
