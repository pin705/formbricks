'use client'

import { parseAsStringEnum, useQueryState } from 'nuqs'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TimeRange } from '../api/types'

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1d', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' }
]

export function TimeRangeTabs() {
  const [range, setRange] = useQueryState(
    'range',
    parseAsStringEnum<TimeRange>(['1d', '7d', '30d', '90d']).withDefault('30d')
  )

  return (
    <Tabs value={range} onValueChange={(v) => setRange(v as TimeRange)}>
      <TabsList>
        {TIME_RANGES.map((r) => (
          <TabsTrigger key={r.value} value={r.value}>
            {r.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export function useTimeRange() {
  const [range] = useQueryState(
    'range',
    parseAsStringEnum<TimeRange>(['1d', '7d', '30d', '90d']).withDefault('30d')
  )
  return range as TimeRange
}
