'use client'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
import { domainsQueryOptions, domainKeys } from '../api/queries'
import { deleteDomainMutation, setPrimaryDomainMutation, verifyDomainMutation } from '../api/mutations'
import type { Domain } from '../api/types'

function DomainRow({ domain }: { domain: Domain }) {
  const qc = useQueryClient()

  const verify = useMutation({
    ...verifyDomainMutation,
    onSuccess: ({ domain: d }) => {
      void qc.invalidateQueries({ queryKey: domainKeys.list() })
      toast.success(d.isVerified ? 'Domain verified!' : 'DNS not propagated yet.')
    }
  })

  const setPrimary = useMutation({
    ...setPrimaryDomainMutation,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: domainKeys.list() })
      toast.success(`${domain.hostname} is now the primary domain`)
    }
  })

  const remove = useMutation({
    ...deleteDomainMutation,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: domainKeys.list() })
      toast.success('Domain removed')
    },
    onError: () => toast.error('Failed to remove domain')
  })

  return (
    <div className='flex items-center justify-between rounded-lg border bg-card px-4 py-3 gap-4'>
      <div className='flex items-center gap-3 min-w-0'>
        <div className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted'>
          <Icons.domains className='size-4 text-muted-foreground' />
        </div>
        <div className='min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='font-medium text-sm truncate'>{domain.hostname}</span>
            {domain.isPrimary && (
              <Badge variant='secondary' className='text-xs'>Primary</Badge>
            )}
            {domain.isVerified ? (
              <Badge className='text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0'>
                <Icons.circleCheck className='mr-1 size-3' />
                Verified
              </Badge>
            ) : (
              <Badge variant='outline' className='text-xs text-yellow-600 border-yellow-300'>
                Pending DNS
              </Badge>
            )}
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {domain.isVerified ? 'Active — links using this domain are live' : 'Add CNAME → cname.dub.co'}
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='shrink-0'>
            <Icons.ellipsis className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {!domain.isVerified && (
            <DropdownMenuItem onClick={() => verify.mutate(domain.id)} disabled={verify.isPending}>
              <Icons.check className='mr-2 size-4' />
              Check DNS
            </DropdownMenuItem>
          )}
          {!domain.isPrimary && domain.isVerified && (
            <DropdownMenuItem onClick={() => setPrimary.mutate(domain.id)} disabled={setPrimary.isPending}>
              <Icons.badgeCheck className='mr-2 size-4' />
              Set as primary
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-destructive focus:text-destructive'
            onClick={() => remove.mutate(domain.id)}
            disabled={remove.isPending}
          >
            <Icons.trash className='mr-2 size-4' />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function DomainListing() {
  const { data } = useSuspenseQuery(domainsQueryOptions())

  if (data.domains.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 py-20 text-center'>
        <div className='flex size-14 items-center justify-center rounded-xl bg-muted'>
          <Icons.domains className='size-6 text-muted-foreground' />
        </div>
        <div className='space-y-1'>
          <p className='font-semibold'>No custom domains</p>
          <p className='text-sm text-muted-foreground max-w-xs'>
            Add a custom domain to create branded short links like <code>go.yourco.com/...</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {data.domains.map((domain) => (
        <DomainRow key={domain.id} domain={domain} />
      ))}
    </div>
  )
}
