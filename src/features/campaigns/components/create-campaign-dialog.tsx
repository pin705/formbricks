'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form'
import { createCampaignMutation } from '../api/mutations'
import { createCampaignSchema, type CreateCampaignFormValues } from '../schemas/campaign'

export function CreateCampaignDialog() {
  const [open, setOpen] = useState(false)

  const createMutation = useMutation({
    ...createCampaignMutation,
    onSuccess: () => {
      toast.success('Campaign created!')
      setOpen(false)
      form.reset()
    },
    onError: () => toast.error('Failed to create campaign')
  })

  const form = useAppForm({
    defaultValues: {
      name: '',
      color: '#6366f1',
      description: ''
    } as CreateCampaignFormValues,
    validators: { onSubmit: createCampaignSchema },
    onSubmit: ({ value }) => createMutation.mutate(value)
  })

  const { FormTextField } = useFormFields<CreateCampaignFormValues>()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm'>
          <Icons.add className='mr-2 h-4 w-4' />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
        </DialogHeader>
        <form.AppForm>
          <form.Form className='space-y-4 mt-2'>
            <FormTextField
              name='name'
              label='Campaign Name'
              required
              placeholder='e.g. Q2 Launch, Black Friday'
              validators={{ onBlur: z.string().min(1, 'Name is required') }}
            />
            <FormTextField
              name='description'
              label='Description'
              placeholder='Optional description'
            />
            <div className='flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <form.SubmitButton>Create</form.SubmitButton>
            </div>
          </form.Form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  )
}
