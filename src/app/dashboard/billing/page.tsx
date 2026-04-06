'use client'

import PageContainer from '@/components/layout/page-container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { useWorkspace } from '@/contexts/workspace-context'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    name: 'free',
    label: 'Free',
    price: '$0',
    description: 'For personal projects',
    features: ['25 links', '1k clicks/mo', '1 domain', '1 member']
  },
  {
    name: 'pro',
    label: 'Pro',
    price: '$12/mo',
    description: 'For growing businesses',
    features: ['500 links', '50k clicks/mo', '3 domains', '3 members', 'Custom slugs', 'Link expiry']
  },
  {
    name: 'team',
    label: 'Team',
    price: '$49/mo',
    description: 'For teams',
    features: ['5k links', '500k clicks/mo', '10 domains', '10 members', 'Advanced analytics', 'API access']
  },
  {
    name: 'agency',
    label: 'Agency',
    price: '$149/mo',
    description: 'For agencies',
    features: ['Unlimited links', '5M clicks/mo', 'Unlimited domains', 'Unlimited members', 'CSV export', 'Priority support']
  }
]

export default function BillingPage() {
  const { plan } = useWorkspace()

  return (
    <PageContainer pageTitle='Billing & Plans' pageDescription='Manage your subscription and plan.'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {PLANS.map((p) => {
          const isCurrent = plan?.name === p.name

          return (
            <Card key={p.name} className={cn(isCurrent && 'border-primary ring-1 ring-primary')}>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-base capitalize'>{p.label}</CardTitle>
                  {isCurrent && (
                    <span className='rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'>
                      Current
                    </span>
                  )}
                </div>
                <CardDescription>{p.description}</CardDescription>
                <p className='text-2xl font-bold'>{p.price}</p>
              </CardHeader>
              <CardContent className='space-y-4'>
                <ul className='space-y-1.5 text-sm text-muted-foreground'>
                  {p.features.map((f) => (
                    <li key={f} className='flex items-center gap-2'>
                      <Icons.check className='size-3.5 shrink-0 text-primary' />
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <Button variant='outline' size='sm' className='w-full' disabled>
                    Upgrade (coming soon)
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageContainer>
  )
}
