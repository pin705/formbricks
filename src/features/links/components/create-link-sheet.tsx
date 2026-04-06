'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as z from 'zod'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { useAppForm, useFormFields } from '@/components/ui/tanstack-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { createLinkMutation, updateLinkMutation } from '../api/mutations'
import { campaignsQueryOptions } from '@/features/campaigns/api/queries'
import { createLinkSchema, type CreateLinkFormValues } from '../schemas/link'
import type { Link } from '../api/types'

interface CreateLinkSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editLink?: Link | null
}

export function CreateLinkSheet({ open, onOpenChange, editLink }: CreateLinkSheetProps) {
  const isEdit = !!editLink

  const { data: campaignsData } = useQuery(campaignsQueryOptions())

  const campaignOptions = (campaignsData?.campaigns ?? []).map((c) => ({
    label: c.name,
    value: c.id
  }))

  const createMutation = useMutation({
    ...createLinkMutation,
    onSuccess: () => {
      toast.success('Link created!')
      onOpenChange(false)
      form.reset()
    },
    onError: (err: Error & { status?: number }) => {
      if (err.message?.includes('402')) {
        toast.error('Link limit reached. Please upgrade your plan.')
      } else {
        toast.error('Failed to create link')
      }
    }
  })

  const updateMutation = useMutation({
    ...updateLinkMutation,
    onSuccess: () => {
      toast.success('Link updated!')
      onOpenChange(false)
    },
    onError: () => toast.error('Failed to update link')
  })

  const form = useAppForm({
    defaultValues: {
      destinationUrl: editLink?.destinationUrl ?? '',
      slug: editLink?.slug ?? '',
      campaignId: editLink?.campaignId ?? '',
      title: editLink?.title ?? '',
      expiresAt: editLink?.expiresAt
        ? new Date(editLink.expiresAt).toISOString().split('T')[0]
        : ''
    } as CreateLinkFormValues,
    validators: {
      onSubmit: createLinkSchema
    },
    onSubmit: ({ value }) => {
      const payload = {
        destinationUrl: value.destinationUrl,
        ...(value.slug ? { slug: value.slug } : {}),
        ...(value.campaignId ? { campaignId: value.campaignId } : {}),
        ...(value.title ? { title: value.title } : {}),
        ...(value.expiresAt ? { expiresAt: new Date(value.expiresAt).toISOString() } : {})
      }

      if (isEdit) {
        updateMutation.mutate({ id: editLink.id, values: payload })
      } else {
        createMutation.mutate(payload)
      }
    }
  })

  const { FormTextField, FormSelectField } = useFormFields<CreateLinkFormValues>()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='sm:max-w-[480px] overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Link' : 'Create Link'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update link settings.'
              : 'Create a new short link. The short URL will be generated automatically.'}
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6'>
          <form.AppForm>
            <form.Form className='space-y-5'>
              <FormTextField
                name='destinationUrl'
                label='Destination URL'
                required
                placeholder='https://example.com/your-long-url'
                validators={{
                  onBlur: z.string().url('Must be a valid URL')
                }}
              />

              <FormTextField
                name='slug'
                label='Custom Slug'
                placeholder='my-campaign-link (optional)'
                description='Leave blank to auto-generate'
                validators={{
                  onBlur: z
                    .string()
                    .regex(/^[a-z0-9-_]*$/, 'Only lowercase letters, numbers, hyphens, underscores')
                    .optional()
                    .or(z.literal(''))
                }}
              />

              {campaignOptions.length > 0 && (
                <FormSelectField
                  name='campaignId'
                  label='Campaign'
                  options={[{ label: 'No campaign', value: '' }, ...campaignOptions]}
                  placeholder='Assign to campaign'
                />
              )}

              <FormTextField
                name='title'
                label='Title'
                placeholder='Optional label for this link'
                description='Used for display only'
              />

              <form.Field name='expiresAt'>
                {(field) => (
                  <div className='space-y-1.5'>
                    <Label htmlFor='expiresAt'>Expiry Date</Label>
                    <Input
                      id='expiresAt'
                      type='date'
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <p className='text-xs text-muted-foreground'>Leave blank for no expiry</p>
                  </div>
                )}
              </form.Field>

              <div className='flex justify-end gap-2 pt-2'>
                <form.SubmitButton>
                  {isEdit ? 'Update Link' : 'Create Link'}
                </form.SubmitButton>
              </div>
            </form.Form>
          </form.AppForm>
        </div>
      </SheetContent>
    </Sheet>
  )
}
