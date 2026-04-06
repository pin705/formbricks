'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/icons'
import { workspaceAnalyticsOptions } from '@/features/analytics/api/queries'
import { linksQueryOptions } from '@/features/links/api/queries'
import { ClicksChart } from '@/features/analytics/components/clicks-chart'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: string | number
  href?: string
  trend?: string
}

function StatCard({ icon: Icon, title, value, href }: StatCardProps) {
  const content = (
    <Card className={href ? 'hover:border-primary/40 transition-colors cursor-pointer' : ''}>
      <CardHeader className='pb-2 flex-row items-center justify-between'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>{title}</CardTitle>
        <Icon className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        <p className='text-2xl font-bold'>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </CardContent>
    </Card>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

interface Props {
  workspaceName: string
}

export function OverviewClient({ workspaceName: _ }: Props) {
  const router = useRouter()
  const { data: analytics } = useSuspenseQuery(workspaceAnalyticsOptions('30d'))
  const { data: linksData } = useSuspenseQuery(linksQueryOptions({ page: 1, limit: 5 }))

  const recentLinks = linksData.links.slice(0, 5)

  return (
    <div className='space-y-6'>
      {/* Stats */}
      <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
        <StatCard
          icon={Icons.trendingUp}
          title='Total clicks (30d)'
          value={analytics.overview.totalClicks}
          href='/dashboard/analytics'
        />
        <StatCard
          icon={Icons.user}
          title='Unique visitors (30d)'
          value={analytics.overview.uniqueClicks}
          href='/dashboard/analytics'
        />
        <StatCard
          icon={Icons.links}
          title='Total links'
          value={linksData.total}
          href='/dashboard/links'
        />
        <StatCard
          icon={Icons.workspace}
          title='Top country'
          value={analytics.overview.topCountry ?? '—'}
        />
      </div>

      {/* Clicks chart */}
      {analytics.timeseries.length > 0 && (
        <Card>
          <CardHeader className='flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>Clicks — last 30 days</CardTitle>
            <Button variant='ghost' size='sm' onClick={() => router.push('/dashboard/analytics')}>
              View full analytics
              <Icons.arrowRight className='ml-1 size-3.5' />
            </Button>
          </CardHeader>
          <CardContent>
            <ClicksChart data={analytics.timeseries} />
          </CardContent>
        </Card>
      )}

      <div className='grid gap-4 md:grid-cols-2'>
        {/* Recent links */}
        <Card>
          <CardHeader className='flex-row items-center justify-between pb-3'>
            <CardTitle className='text-sm font-medium'>Recent Links</CardTitle>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/dashboard/links'>View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentLinks.length === 0 ? (
              <div className='flex flex-col items-center gap-3 py-8 text-center'>
                <Icons.link className='size-8 text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>No links yet</p>
              </div>
            ) : (
              <div className='space-y-1'>
                {recentLinks.map((link) => {
                  const shortUrl = (link.shortUrl ?? `/${link.slug}`).replace(/^https?:\/\//, '')
                  return (
                    <div
                      key={link.id}
                      className='flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors cursor-pointer'
                      onClick={() => router.push(`/dashboard/links/${link.id}`)}
                    >
                      <div className='flex size-7 shrink-0 items-center justify-center rounded-md bg-muted'>
                        <Icons.link className='size-3.5 text-muted-foreground' />
                      </div>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-medium truncate'>{shortUrl}</p>
                        <p className='text-xs text-muted-foreground truncate'>{link.destinationUrl}</p>
                      </div>
                      <div className='flex items-center gap-1.5 shrink-0'>
                        {link.campaign && (
                          <span
                            className='size-2 rounded-full shrink-0'
                            style={{ background: link.campaign.color }}
                            title={link.campaign.name}
                          />
                        )}
                        {!link.isActive && (
                          <Badge variant='outline' className='text-xs'>Inactive</Badge>
                        )}
                        <span className='text-xs text-muted-foreground'>
                          {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top links */}
        <Card>
          <CardHeader className='flex-row items-center justify-between pb-3'>
            <CardTitle className='text-sm font-medium'>Top Links (30d)</CardTitle>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/dashboard/analytics'>View analytics</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!analytics.topLinks || analytics.topLinks.length === 0 ? (
              <div className='flex flex-col items-center gap-3 py-8 text-center'>
                <Icons.trendingUp className='size-8 text-muted-foreground' />
                <p className='text-sm text-muted-foreground'>No click data yet</p>
              </div>
            ) : (
              <div className='space-y-2'>
                {analytics.topLinks.slice(0, 5).map((link, i) => {
                  const display = (link.shortUrl || link.slug).replace(/^https?:\/\//, '')
                  return (
                    <div key={link.id} className='flex items-center gap-3'>
                      <span className='text-muted-foreground text-sm w-4 shrink-0 tabular-nums'>{i + 1}</span>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium truncate'>{display}</p>
                      </div>
                      <span className='text-sm font-semibold tabular-nums shrink-0'>
                        {link.clicks.toLocaleString()}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
