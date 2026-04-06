'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { AlertModal } from '@/components/modal/alert-modal'
import { Icons } from '@/components/icons'
import { deleteLinkMutation } from '../../api/mutations'
import type { Link } from '../../api/types'

interface LinkCellActionsProps {
  link: Link
  onEdit?: (link: Link) => void
}

export function LinkCellActions({ link, onEdit }: LinkCellActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const router = useRouter()

  const deleteMutation = useMutation({
    ...deleteLinkMutation,
    onSuccess: () => {
      toast.success('Link deleted')
      setDeleteOpen(false)
    },
    onError: () => toast.error('Failed to delete link')
  })

  const shortUrl = link.shortUrl ?? `/${link.slug}`

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate(link.id)}
        loading={deleteMutation.isPending}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <Icons.ellipsis className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-44'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(shortUrl)
              toast.success('Copied!')
            }}
          >
            <Icons.share className='mr-2 h-4 w-4' /> Copy link
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/links/${link.id}`)}
          >
            <Icons.trendingUp className='mr-2 h-4 w-4' /> View analytics
          </DropdownMenuItem>
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(link)}>
              <Icons.edit className='mr-2 h-4 w-4' /> Edit
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className='text-destructive focus:text-destructive'
          >
            <Icons.trash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
