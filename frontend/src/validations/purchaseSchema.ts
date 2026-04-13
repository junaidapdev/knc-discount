import { z } from 'zod'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import { BDA_CATEGORIES } from '../constants/bdaRules'
import { NOTES_MAX_LENGTH } from '../constants/appConstants'

export const purchaseSchema = z.object({
  supplier_id: z.string().uuid(ERROR_MESSAGES.FIELD_REQUIRED),
  purchase_amount: z
    .number({ invalid_type_error: ERROR_MESSAGES.INVALID_AMOUNT })
    .positive(ERROR_MESSAGES.INVALID_AMOUNT),
  order_date: z.string().min(1, ERROR_MESSAGES.INVALID_DATE),
  bda_category: z.enum(BDA_CATEGORIES, {
    errorMap: () => ({ message: ERROR_MESSAGES.FIELD_REQUIRED }),
  }),
  notes: z.string().max(NOTES_MAX_LENGTH).default(''),
})

export type PurchaseFormValues = z.infer<typeof purchaseSchema>
