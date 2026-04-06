'use client'

import type { GeoRow } from '../api/types'

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸', VN: '🇻🇳', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺',
  DE: '🇩🇪', FR: '🇫🇷', JP: '🇯🇵', SG: '🇸🇬', IN: '🇮🇳',
  BR: '🇧🇷', MX: '🇲🇽', KR: '🇰🇷', NL: '🇳🇱', ID: '🇮🇩'
}

interface GeoTableProps {
  data: GeoRow[]
}

export function GeoTable({ data }: GeoTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className='py-8 text-center text-muted-foreground text-sm'>
        No geographic data yet
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      {data.slice(0, 10).map((row) => (
        <div key={row.country} className='flex items-center gap-3'>
          <span className='text-base w-6 text-center'>
            {COUNTRY_FLAGS[row.country] ?? '🌐'}
          </span>
          <span className='flex-1 text-sm font-medium truncate'>{row.country}</span>
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
