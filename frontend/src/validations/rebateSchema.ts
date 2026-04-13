import { z } from 'zod'
import { ERROR_MESSAGES } from '../constants/errorMessages'

export const rebateVerifySchema = z.object({
  receivedAmount: z.number({ invalid_type_error: ERROR_MESSAGES.INVALID_AMOUNT }).nonnegative(ERROR_MESSAGES.INVALID_AMOUNT),
  notes: z.string().nullable().optional(),
})

export type RebateVerifyFormData = z.infer<typeof rebateVerifySchema>
