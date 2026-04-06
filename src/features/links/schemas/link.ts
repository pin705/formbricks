import * as z from 'zod'

export const createLinkSchema = z.object({
  destinationUrl: z
    .string()
    .min(1, 'Destination URL is required')
    .url('Must be a valid URL'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must be under 50 characters')
    .regex(/^[a-z0-9-_]+$/, 'Slug can only contain lowercase letters, numbers, hyphens, underscores')
    .optional()
    .or(z.literal('')),
  campaignId: z.string().optional().or(z.literal('')),
  domainId: z.string().optional().or(z.literal('')),
  title: z.string().max(120).optional().or(z.literal('')),
  expiresAt: z.string().optional().or(z.literal(''))
})

export const updateLinkSchema = createLinkSchema.partial().extend({
  isActive: z.boolean().optional()
})

export type CreateLinkFormValues = z.infer<typeof createLinkSchema>
export type UpdateLinkFormValues = z.infer<typeof updateLinkSchema>
