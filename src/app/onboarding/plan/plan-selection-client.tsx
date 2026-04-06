'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  maxLinks: number
  maxClicksPerMonth: number
  maxDomains: number
  maxMembers: number
  analyticsRetentionDays: number
  hasCustomSlugs: boolean
  hasPasswordProtect: boolean
  hasLinkExpiry: boolean
  hasAdvancedAnalytics: boolean
  hasApiAccess: boolean
  stripePriceId: string | null
}

interface Workspace {
  id: string
  name: string
}

interface Props {
  workspace: Workspace
  plans: Plan[]
}

const PLAN_DESCRIPTIONS: Record<string, string> = {
  free: 'Perfect for personal projects and experimentation.',
  pro: 'For growing businesses that need more power.',
  team: 'Collaborate with your whole team.',
  agency: 'Unlimited scale for agencies and enterprises.'
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${n / 1_000_000}M`
  if (n >= 1_000) return `${n / 1_000}k`
  return String(n)
}

export default function PlanSelectionClient({ workspace, plans }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string>(plans[0]?.id ?? '')
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    const plan = plans.find((p) => p.id === selected)
    if (!plan) return

    setLoading(true)

    if (plan.stripePriceId) {
      // Redirect to Stripe checkout (placeholder)
      toast.info('Stripe checkout coming soon. Starting with free plan.')
    }

    // For free plan (or until Stripe is wired), just redirect to dashboard
    router.push('/dashboard/links')
  }

  return (
    <div className='space-y-8'>
      {/* Progress */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>Step 2 of 2</span>
          <span>Choose a plan</span>
        </div>
        <div className='h-1.5 w-full rounded-full bg-muted'>
          <div className='h-full w-full rounded-full bg-primary transition-all' />
        </div>
      </div>

      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold'>Choose your plan</h1>
        <p className='text-muted-foreground'>
          You can always upgrade later. Start free, no credit card required.
        </p>
      </div>

      <div className='grid gap-3'>
        {plans.map((plan) => {
          const isSelected = plan.id === selected
          const isPaid = !!plan.stripePriceId

          return (
            <button
              key={plan.id}
              type='button'
              onClick={() => setSelected(plan.id)}
              className={cn(
                'relative flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors',
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
              )}
            >
              <div
                className={cn(
                  'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                )}
              >
                {isSelected && <Icons.check className='size-3 text-primary-foreground' />}
              </div>

              <div className='flex-1 space-y-1'>
                <div className='flex items-center gap-2'>
                  <span className='font-semibold capitalize'>{plan.name}</span>
                  {!isPaid && (
                    <span className='rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400'>
                      Free
                    </span>
                  )}
                  {isPaid && (
                    <span className='rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'>
                      Paid
                    </span>
                  )}
                </div>
                <p className='text-sm text-muted-foreground'>
                  {PLAN_DESCRIPTIONS[plan.name] ?? ''}
                </p>
                <div className='flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground'>
                  <span>{formatNumber(plan.maxLinks)} links</span>
                  <span>{formatNumber(plan.maxClicksPerMonth)} clicks/mo</span>
                  <span>{plan.maxDomains} custom domains</span>
                  <span>{plan.maxMembers} members</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className='flex flex-col gap-3'>
        <Button onClick={handleContinue} disabled={loading || !selected} className='w-full'>
          {loading && <Icons.spinner className='mr-2 size-4 animate-spin' />}
          Get started with {workspace.name}
          {!loading && <Icons.arrowRight className='ml-2 size-4' />}
        </Button>
        <p className='text-center text-xs text-muted-foreground'>
          You can change your plan at any time from billing settings.
        </p>
      </div>
    </div>
  )
}
