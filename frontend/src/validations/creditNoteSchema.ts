import { z } from 'zod'
import { ERROR_MESSAGES } from '../constants/errorMessages'

export const creditNoteSchema = z.object({
  creditNoteNumber: z.string().min(1, ERROR_MESSAGES.FIELD_REQUIRED),
  purchaseOrderId: z.string().min(1, ERROR_MESSAGES.FIELD_REQUIRED),
  supplierId: z.string().min(1, ERROR_MESSAGES.FIELD_REQUIRED),
  issueDate: z.string().min(1, ERROR_MESSAGES.INVALID_DATE),
  amount: z.number({ invalid_type_error: ERROR_MESSAGES.INVALID_AMOUNT }).positive(ERROR_MESSAGES.INVALID_AMOUNT),
  currency: z.string().min(1, ERROR_MESSAGES.FIELD_REQUIRED),
  notes: z.string().nullable().optional(),
})

export type CreditNoteFormData = z.infer<typeof creditNoteSchema>
