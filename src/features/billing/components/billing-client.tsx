'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface Plan {
  id: string
  name: string
  maxLinks: number
  maxClicksPerMonth: number
  maxDomains: number
  maxMembers: number
  analyticsRetentionDays: number
  hasCustomSlugs: boolean
  hasAdvancedAnalytics: boolean
  hasApiAccess: boolean
  hasCsvExport: boolean
  stripePriceId: string | null
}

interface UsageResponse {
  period: string
  plan: {
    name: string
    maxLinks: number
    maxDomains: number
    maxMembers: number
    maxClicksPerMonth: number
    analyticsRetentionDays: number
  } | null
  usage: {
    linksCreatedThisPeriod: number
    domainsAdded: number
    totalLinks: number
  }
}

interface Props {
  plans: Plan[]
  currentPlanId: string | null
}

const PLAN_FEATURES: Record<string, string[]> = {
  free: ['25 links', '1k clicks/mo', '1 domain', '1 member', '7-day analytics'],
  pro: ['500 links', '50k clicks/mo', '3 domains', '3 members', '30-day analytics', 'Custom slugs', 'Link expiry'],
  team: ['5k links', '500k clicks/mo', '10 domains', '10 members', '90-day analytics', 'Advanced analytics', 'API access'],
  agency: ['Unlimited links', '5M clicks/mo', 'Unlimited domains', 'Unlimited members', '1-year analytics', 'CSV export', 'Priority support']
}

const PLAN_PRICES: Record<string, string> = {
  free: '$0',
  pro: '$12/mo',
  team: '$49/mo',
  agency: '$149/mo'
}

function UsageBar({ label, current, max, suffix = '' }: { label: string; current: number; max: number; suffix?: string }) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0
  const isHigh = pct >= 80
  const isOver = pct >= 100

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between text-sm'>
        <span className='text-muted-foreground'>{label}</span>
        <span className={cn('font-medium tabular-nums', isOver && 'text-destructive', isHigh && !isOver && 'text-yellow-600 dark:text-yellow-400')}>
          {current.toLocaleString()}{suffix} / {max === -1 ? '∞' : `${max.toLocaleString()}${suffix}`}
        </span>
      </div>
      <Progress
        value={pct}
        className={cn('h-1.5', isOver && '[&>div]:bg-destructive', isHigh && !isOver && '[&>div]:bg-yellow-500')}
      />
    </div>
  )
}

export function BillingClient({ plans, currentPlanId }: Props) {
  const { data: usageData, isLoading } = useQuery({
    queryKey: ['workspace', 'usage'],
    queryFn: () => apiClient<UsageResponse>('/workspace/usage')
  })

  const currentPlan = plans.find((p) => p.id === currentPlanId)

  return (
    <div className='space-y-8'>
      {/* Current usage */}
      {currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Current Usage</CardTitle>
            <CardDescription>
              {usageData?.period ? `Period: ${usageData.period}` : 'This billing period'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {isLoading ? (
              <div className='space-y-3'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='h-8 animate-pulse rounded bg-muted' />
                ))}
              </div>
            ) : usageData ? (
              <>
                <UsageBar
                  label='Links created this period'
                  current={usageData.usage.linksCreatedThisPeriod}
                  max={currentPlan.maxLinks}
                />
                <UsageBar
                  label='Custom domains'
                  current={usageData.usage.domainsAdded}
                  max={currentPlan.maxDomains}
                />
                <div className='pt-1 text-xs text-muted-foreground'>
                  Total links in workspace:{' '}
                  <span className='font-medium text-foreground'>{usageData.usage.totalLinks.toLocaleString()}</span>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Plan cards */}
      <div>
        <h2 className='mb-4 font-semibold'>Plans</h2>
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId
            const isPaid = !!plan.stripePriceId
            const features = PLAN_FEATURES[plan.name] ?? []

            return (
              <Card key={plan.id} className={cn(isCurrent && 'border-primary ring-1 ring-primary')}>
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-base capitalize'>{plan.name}</CardTitle>
                    {isCurrent && (
                      <span className='rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'>
                        Current
                      </span>
                    )}
                  </div>
                  <p className='text-2xl font-bold'>{PLAN_PRICES[plan.name] ?? '—'}</p>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <ul className='space-y-1.5 text-sm text-muted-foreground'>
                    {features.map((f) => (
                      <li key={f} className='flex items-center gap-2'>
                        <Icons.check className='size-3.5 shrink-0 text-primary' />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {!isCurrent && isPaid && (
                    <Button variant='outline' size='sm' className='w-full' disabled>
                      Upgrade (coming soon)
                    </Button>
                  )}
                  {!isCurrent && !isPaid && (
                    <Button variant='ghost' size='sm' className='w-full text-muted-foreground' disabled>
                      Downgrade
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
