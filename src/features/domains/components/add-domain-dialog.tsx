'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/icons'
import { addDomainMutation, verifyDomainMutation } from '../api/mutations'
import { domainKeys } from '../api/queries'
import type { Domain } from '../api/types'

function DnsInstructions({ domain }: { domain: Domain }) {
  const qc = useQueryClient()
  const verify = useMutation({
    ...verifyDomainMutation,
    onSuccess: ({ domain: d }) => {
      void qc.invalidateQueries({ queryKey: domainKeys.list() })
      if (d.isVerified) {
        toast.success('Domain verified!')
      } else {
        toast.info('DNS not propagated yet — try again in a few minutes.')
      }
    }
  })

  return (
    <div className='space-y-4 pt-2'>
      <p className='text-sm text-muted-foreground'>
        Add the following DNS record at your domain registrar, then click <strong>Check DNS</strong>.
      </p>
      <div className='rounded-lg border bg-muted/40 p-4 space-y-3 text-sm font-mono'>
        <div className='grid grid-cols-[80px_1fr] gap-2'>
          <span className='text-muted-foreground'>Type</span>
          <span>CNAME</span>
        </div>
        <div className='grid grid-cols-[80px_1fr] gap-2'>
          <span className='text-muted-foreground'>Name</span>
          <span>{domain.hostname}</span>
        </div>
        <div className='grid grid-cols-[80px_1fr] gap-2'>
          <span className='text-muted-foreground'>Value</span>
          <span>cname.dub.co</span>
        </div>
      </div>
      {domain.isVerified ? (
        <div className='flex items-center gap-2 text-sm text-green-600 dark:text-green-400'>
          <Icons.circleCheck className='size-4' />
          Domain verified
        </div>
      ) : (
        <Button
          variant='outline'
          size='sm'
          onClick={() => verify.mutate(domain.id)}
          disabled={verify.isPending}
        >
          {verify.isPending && <Icons.spinner className='mr-2 size-4 animate-spin' />}
          Check DNS
        </Button>
      )}
    </div>
  )
}

export function AddDomainDialog() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [hostname, setHostname] = useState('')
  const [addedDomain, setAddedDomain] = useState<Domain | null>(null)

  const add = useMutation({
    ...addDomainMutation,
    onSuccess: ({ domain }) => {
      void qc.invalidateQueries({ queryKey: domainKeys.list() })
      setAddedDomain(domain)
      toast.success('Domain added')
    },
    onError: (err: Error) => toast.error(err.message ?? 'Failed to add domain')
  })

  const handleClose = () => {
    setOpen(false)
    setHostname('')
    setAddedDomain(null)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true) }}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Icons.add className='mr-2 size-4' />
          Add Domain
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <DialogTitle>Add Custom Domain</DialogTitle>
          <DialogDescription>
            Use your own domain for short links (e.g. <code>go.yourcompany.com</code>).
          </DialogDescription>
        </DialogHeader>

        {!addedDomain ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (hostname) add.mutate(hostname.trim())
            }}
            className='space-y-4 pt-2'
          >
            <div className='space-y-1.5'>
              <Label htmlFor='hostname'>Domain</Label>
              <Input
                id='hostname'
                placeholder='go.yourcompany.com'
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type='button' variant='ghost' onClick={handleClose}>
                Cancel
              </Button>
              <Button type='submit' disabled={add.isPending || !hostname}>
                {add.isPending && <Icons.spinner className='mr-2 size-4 animate-spin' />}
                Continue
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DnsInstructions domain={addedDomain} />
            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
