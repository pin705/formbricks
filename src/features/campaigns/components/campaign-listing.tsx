'use client'

import { useState } from 'react'
import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { campaignsQueryOptions } from '../api/queries'
import { deleteCampaignMutation } from '../api/mutations'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertModal } from '@/components/modal/alert-modal'
import { Icons } from '@/components/icons'
import { CreateCampaignDialog } from './create-campaign-dialog'
import type { Campaign } from '../api/types'

export function CampaignListing() {
  const { data } = useSuspenseQuery(campaignsQueryOptions())
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null)

  const deleteMutation = useMutation({
    ...deleteCampaignMutation,
    onSuccess: () => {
      toast.success('Campaign deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete campaign')
  })

  if (data.campaigns.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 py-24 text-center'>
        <div className='rounded-full bg-muted p-4'>
          <Icons.galleryVerticalEnd className='h-8 w-8 text-muted-foreground' />
        </div>
        <div>
          <p className='font-semibold text-lg'>No campaigns yet</p>
          <p className='text-muted-foreground text-sm mt-1'>
            Group your links by campaign to track performance across channels.
          </p>
        </div>
        <CreateCampaignDialog />
      </div>
    )
  }

  return (
    <>
      <AlertModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {data.campaigns.map((campaign) => (
          <Card key={campaign.id} className='relative group'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span
                    className='h-3 w-3 rounded-full shrink-0'
                    style={{ background: campaign.color }}
                  />
                  <CardTitle className='text-base'>{campaign.name}</CardTitle>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity'
                  onClick={() => setDeleteTarget(campaign)}
                >
                  <Icons.trash className='h-3.5 w-3.5 text-destructive' />
                </Button>
              </div>
              {campaign.description && (
                <CardDescription className='text-xs mt-1'>{campaign.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <Badge variant='secondary' className='text-xs'>
                {campaign._count?.links ?? 0} links
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
