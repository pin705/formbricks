'use client'

import { DataTable } from '@/components/ui/table/data-table'
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar'
import { useDataTable } from '@/hooks/use-data-table'
import { useSuspenseQuery } from '@tanstack/react-query'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { getSortingStateParser } from '@/lib/parsers'
import { linksQueryOptions } from '../../api/queries'
import { columns } from './columns'

const columnIds = ['shortUrl', 'createdAt']

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
      <DataTableToolbar table={table} />
    </DataTable>
  )
}
