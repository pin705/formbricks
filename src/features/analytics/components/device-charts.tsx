'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { DeviceRow } from '../api/types'

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--primary) / 0.7)',
  'hsl(var(--primary) / 0.5)',
  'hsl(var(--primary) / 0.35)',
  'hsl(var(--primary) / 0.2)'
]

interface MiniPieProps {
  data: DeviceRow[]
  title: string
}

function MiniPie({ data, title }: MiniPieProps) {
  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center gap-2'>
        <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>{title}</p>
        <div className='h-[120px] flex items-center justify-center text-muted-foreground text-xs'>
          No data
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center gap-1'>
      <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>{title}</p>
      <ResponsiveContainer width='100%' height={140}>
        <PieChart>
          <Pie
            data={data}
            dataKey='clicks'
            nameKey='label'
            cx='50%'
            cy='50%'
            outerRadius={50}
            strokeWidth={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 8,
              fontSize: 11
            }}
            formatter={(value: number, name: string) => [value.toLocaleString(), name]}
          />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

interface DeviceChartsProps {
  devices: DeviceRow[]
  browsers: DeviceRow[]
  os: DeviceRow[]
}

export function DeviceCharts({ devices, browsers, os }: DeviceChartsProps) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
      <MiniPie data={devices} title='Devices' />
      <MiniPie data={browsers} title='Browsers' />
      <MiniPie data={os} title='OS' />
    </div>
  )
}
