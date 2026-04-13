import { z } from 'zod'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import { POINTS_DESCRIPTION_MAX_LENGTH } from '../constants/appConstants'

export const pointSchema = z.object({
  supplier_id: z.string().uuid(ERROR_MESSAGES.FIELD_REQUIRED).nullable(),
  item_description: z
    .string()
    .min(1, ERROR_MESSAGES.FIELD_REQUIRED)
    .max(POINTS_DESCRIPTION_MAX_LENGTH),
  points_earned: z
    .number({ invalid_type_error: ERROR_MESSAGES.INVALID_AMOUNT })
    .int()
    .min(1, ERROR_MESSAGES.INVALID_AMOUNT),
  redeemed: z.boolean().default(false),
  redeemed_for: z.string().nullable().default(null),
})

export type PointFormValues = z.infer<typeof pointSchema>
