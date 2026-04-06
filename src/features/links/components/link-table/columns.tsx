'use client'

import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import type { Link } from '../../api/types'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { toggleLinkMutation } from '../../api/mutations'
import { LinkCellActions } from './cell-actions'

function CopyButton({ url }: { url: string }) {
  return (
    <Button
      variant='ghost'
      size='icon'
      className='h-6 w-6 shrink-0'
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(url)
        toast.success('Copied to clipboard')
      }}
    >
      <Icons.share className='h-3 w-3' />
    </Button>
  )
}

function StatusToggle({ link }: { link: Link }) {
  const mutation = useMutation(toggleLinkMutation)
  return (
    <Switch
      checked={link.isActive}
      onCheckedChange={(checked) =>
        mutation.mutate({ id: link.id, isActive: checked })
      }
      onClick={(e) => e.stopPropagation()}
    />
  )
}

export const columns: ColumnDef<Link>[] = [
  {
    id: 'shortUrl',
    accessorKey: 'shortUrl',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Short URL' />,
    cell: ({ row }) => {
      const url = row.original.shortUrl ?? `/${row.original.slug}`
      const display = url.replace(/^https?:\/\//, '')
      return (
        <div className='flex items-center gap-1.5 min-w-0'>
          <span className='font-medium text-sm truncate max-w-[140px]'>{display}</span>
          <CopyButton url={url} />
        </div>
      )
    },
    meta: {
      label: 'Short URL',
      placeholder: 'Search links...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'destinationUrl',
    accessorKey: 'destinationUrl',
    header: 'Destination',
    cell: ({ row }) => {
      const url = row.original.destinationUrl
      const display = url.replace(/^https?:\/\//, '').slice(0, 40) + (url.length > 40 ? '…' : '')
      return (
        <a
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-muted-foreground text-sm hover:text-foreground transition-colors flex items-center gap-1 max-w-[200px] truncate'
          onClick={(e) => e.stopPropagation()}
        >
          {display}
          <Icons.externalLink className='h-3 w-3 shrink-0' />
        </a>
      )
    }
  },
  {
    id: 'campaign',
    accessorKey: 'campaignId',
    header: 'Campaign',
    enableSorting: false,
    cell: ({ row }) => {
      const campaign = row.original.campaign
      if (!campaign) return <span className='text-muted-foreground text-sm'>—</span>
      return (
        <Badge
          variant='outline'
          className='gap-1.5 font-normal text-xs'
          style={{ borderColor: campaign.color, color: campaign.color }}
        >
          <span
            className='h-1.5 w-1.5 rounded-full shrink-0'
            style={{ background: campaign.color }}
          />
          {campaign.name}
        </Badge>
      )
    }
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: 'Active',
    enableSorting: false,
    cell: ({ row }) => <StatusToggle link={row.original} />
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title='Created' />,
    cell: ({ row }) => (
      <span className='text-muted-foreground text-sm'>
        {formatDistanceToNow(new Date(row.original.createdAt), { addSuffix: true })}
      </span>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <LinkCellActions link={row.original} />
  }
]
