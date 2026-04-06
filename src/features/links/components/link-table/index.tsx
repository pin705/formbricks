'use client'

import { DataTable } from '@/components/ui/table/data-table'
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useSuspenseQuery, useQuery } from '@tanstack/react-query'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { getSortingStateParser } from '@/lib/parsers'
import { linksQueryOptions } from '../../api/queries'
import { columns } from './columns'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
import { campaignsQueryOptions } from '@/features/campaigns/api/queries'
import { cn } from '@/lib/utils'

const columnIds = ['shortUrl', 'createdAt']

function CampaignFilter() {
  const [params, setParams] = useQueryStates({
    campaignId: parseAsString
  })
  const { data } = useQuery(campaignsQueryOptions())
  const campaigns = data?.campaigns ?? []

  if (campaigns.length === 0) return null

  const active = campaigns.find((c) => c.id === params.campaignId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn('border-dashed h-8', active && 'border-primary bg-primary/5 text-primary')}
        >
          <Icons.campaigns className='mr-1.5 size-3.5' />
          {active ? active.name : 'Campaign'}
          {active && (
            <span
              className='ml-1.5 rounded-full bg-primary/20 px-1.5 text-xs'
              onClick={(e) => {
                e.stopPropagation()
                void setParams({ campaignId: null })
              }}
            >
              ✕
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-48'>
        <DropdownMenuLabel className='text-xs text-muted-foreground'>Filter by campaign</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {campaigns.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onClick={() => void setParams({ campaignId: c.id === params.campaignId ? null : c.id })}
            className='gap-2'
          >
            <span className='size-2.5 shrink-0 rounded-full' style={{ background: c.color }} />
            {c.name}
            {c.id === params.campaignId && <Icons.check className='ml-auto size-3.5' />}
          </DropdownMenuItem>
        ))}
        {params.campaignId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void setParams({ campaignId: null })} className='text-muted-foreground'>
              Clear filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function LinksTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(20),
    search: parseAsString,
    campaignId: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([])
  })

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.search ? { search: params.search } : {}),
    ...(params.campaignId ? { campaignId: params.campaignId } : {}),
    ...(params.sort.length > 0 ? { sort: JSON.stringify(params.sort) } : {})
  }

  const { data } = useSuspenseQuery(linksQueryOptions(filters))

  const { table } = useDataTable({
    data: data.links,
    columns,
    pageCount: data.pageCount,
    shallow: true,
    debounceMs: 400,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  })

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <CampaignFilter />
      </DataTableToolbar>
    </DataTable>
  )
}
