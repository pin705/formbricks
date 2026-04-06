import * as z from 'zod'

export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60, 'Name must be under 60 characters'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').optional(),
  description: z.string().max(200).optional().or(z.literal(''))
})

export type CreateCampaignFormValues = z.infer<typeof createCampaignSchema>
