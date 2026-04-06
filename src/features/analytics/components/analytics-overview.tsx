'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Icons } from '@/components/icons'
import { workspaceAnalyticsOptions } from '../api/queries'
import { ClicksChart } from './clicks-chart'
import { GeoTable } from './geo-table'
import { ReferrerTable } from './referrer-table'
import { DeviceCharts } from './device-charts'
import { useTimeRange } from './time-range-tabs'

function StatCard({ icon: Icon, title, value }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  value: string | number
}) {
  return (
    <Card>
      <CardHeader className='pb-2 flex-row items-center justify-between'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>{title}</CardTitle>
        <Icon className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        <p className='text-2xl font-bold'>{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </CardContent>
    </Card>
  )
}

export function AnalyticsOverview() {
  const range = useTimeRange()
  const { data } = useSuspenseQuery(workspaceAnalyticsOptions(range))

  return (
    <div className='space-y-6'>
      {/* Stats row */}
      <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
        <StatCard icon={Icons.trendingUp} title='Total Clicks' value={data.overview.totalClicks} />
        <StatCard icon={Icons.user} title='Unique Clicks' value={data.overview.uniqueClicks} />
        <StatCard icon={Icons.workspace} title='Top Country' value={data.overview.topCountry ?? '—'} />
        <StatCard icon={Icons.externalLink} title='Top Referrer' value={data.overview.topReferrer ?? '—'} />
      </div>

      {/* Clicks chart */}
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Clicks Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ClicksChart data={data.timeseries} />
        </CardContent>
      </Card>

      {/* Geo + Referrers */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <GeoTable data={data.geo} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <ReferrerTable data={data.referrers} />
          </CardContent>
        </Card>
      </div>

      {/* Device breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className='text-sm font-medium'>Device Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <DeviceCharts devices={data.devices} browsers={data.browsers} os={data.os} />
        </CardContent>
      </Card>

      {/* Top links */}
      {data.topLinks && data.topLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>Top Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {data.topLinks.map((link, i) => (
                <div key={link.id} className='flex items-center gap-3'>
                  <span className='text-muted-foreground text-sm w-4'>{i + 1}</span>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>
                      {link.shortUrl || link.slug}
                    </p>
                    <p className='text-xs text-muted-foreground truncate'>{link.destinationUrl}</p>
                  </div>
                  <span className='text-sm font-semibold shrink-0'>
                    {link.clicks.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
