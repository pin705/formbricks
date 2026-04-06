'use client'

import type { ReferrerRow } from '../api/types'

interface ReferrerTableProps {
  data: ReferrerRow[]
}

export function ReferrerTable({ data }: ReferrerTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className='py-8 text-center text-muted-foreground text-sm'>
        No referrer data yet
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      {data.slice(0, 10).map((row) => (
        <div key={row.referrer} className='flex items-center gap-3'>
          <span className='flex-1 text-sm font-medium truncate'>
            {row.referrer === '(direct)' ? (
              <span className='text-muted-foreground'>(direct / none)</span>
            ) : (
              row.referrer
            )}
          </span>
          <div className='flex items-center gap-2'>
            <div className='h-1.5 rounded-full bg-muted w-20 overflow-hidden'>
              <div
                className='h-full bg-primary rounded-full'
                style={{ width: `${Math.min(row.percentage, 100)}%` }}
              />
            </div>
            <span className='text-xs text-muted-foreground w-8 text-right'>
              {row.clicks.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
