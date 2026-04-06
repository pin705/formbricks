'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { TimeseriesPoint } from '../api/types'

interface ClicksChartProps {
  data: TimeseriesPoint[]
}

export function ClicksChart({ data }: ClicksChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className='flex h-[200px] items-center justify-center text-muted-foreground text-sm'>
        No click data for this period
      </div>
    )
  }

  const formatted = data.map((p) => ({
    date: format(parseISO(p.date), 'MMM d'),
    clicks: p.clicks
  }))

  return (
    <ResponsiveContainer width='100%' height={220}>
      <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id='clickGradient' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='hsl(var(--primary))' stopOpacity={0.3} />
            <stop offset='95%' stopColor='hsl(var(--primary))' stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
        <XAxis
          dataKey='date'
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            fontSize: 12
          }}
          labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
          itemStyle={{ color: 'hsl(var(--primary))' }}
        />
        <Area
          type='monotone'
          dataKey='clicks'
          stroke='hsl(var(--primary))'
          strokeWidth={2}
          fill='url(#clickGradient)'
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
