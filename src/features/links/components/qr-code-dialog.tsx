'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { toast } from 'sonner'
import type { Link } from '../api/types'

interface QRCodeDialogProps {
  link: Link
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRCodeDialog({ link, open, onOpenChange }: QRCodeDialogProps) {
  const shortUrl = link.shortUrl ?? `https://dub.link/${link.slug}`
  const qrUrl = `https://api.dub.co/qr?url=${encodeURIComponent(shortUrl)}&size=256&margin=2`
  const displayUrl = shortUrl.replace(/^https?:\/\//, '')

  const handleDownload = async () => {
    try {
      const res = await fetch(qrUrl)
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `qr-${link.slug}.png`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      toast.error('Failed to download QR code')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[300px]'>
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col items-center gap-4 py-2'>
          <div className='rounded-xl border bg-white p-3'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt={`QR code for ${displayUrl}`}
              width={200}
              height={200}
              className='rounded'
            />
          </div>
          <p className='text-center text-xs text-muted-foreground max-w-[240px] truncate'>
            {displayUrl}
          </p>
          <div className='flex gap-2 w-full'>
            <Button variant='outline' className='flex-1' size='sm' onClick={handleDownload}>
              <Icons.upload className='mr-1.5 size-3.5' />
              Download
            </Button>
            <Button
              variant='outline'
              className='flex-1'
              size='sm'
              onClick={() => {
                navigator.clipboard.writeText(shortUrl)
                toast.success('Copied!')
              }}
            >
              <Icons.share className='mr-1.5 size-3.5' />
              Copy URL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
