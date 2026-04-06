'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { linkAnalyticsOptions } from '../api/queries'
import { ClicksChart } from './clicks-chart'
import { GeoTable } from './geo-table'
import { ReferrerTable } from './referrer-table'
import { DeviceCharts } from './device-charts'
import { useTimeRange } from './time-range-tabs'

interface LinkAnalyticsViewProps {
  linkId: string
}

export function LinkAnalyticsView({ linkId }: LinkAnalyticsViewProps) {
  const range = useTimeRange()
  const { data } = useSuspenseQuery(linkAnalyticsOptions(linkId, range))

  return (
    <div className='space-y-6'>
      {/* Stats */}
      <div className='grid gap-4 grid-cols-2 md:grid-cols-4'>
        {[
          { label: 'Total Clicks', value: data.overview.totalClicks },
          { label: 'Unique Clicks', value: data.overview.uniqueClicks },
          { label: 'Top Country', value: data.overview.topCountry ?? '—' },
          { label: 'Top Referrer', value: data.overview.topReferrer ?? '—' }
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className='pb-1'>
              <CardTitle className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-2xl font-bold'>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
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
    </div>
  )
}
