import { z } from 'zod'
import { ERROR_MESSAGES } from '../constants/errorMessages'

export const purchaseOrderSchema = z.object({
  poNumber: z.string().min(1, ERROR_MESSAGES.FIELD_REQUIRED),
  supplierId: z.string().min(1, ERROR_MESSAGES.FIELD_REQUIRED),
  orderDate: z.string().min(1, ERROR_MESSAGES.INVALID_DATE),
  deliveryDate: z.string().nullable().optional(),
  totalAmount: z.number({ invalid_type_error: ERROR_MESSAGES.INVALID_AMOUNT }).positive(ERROR_MESSAGES.INVALID_AMOUNT),
  currency: z.string().min(1, ERROR_MESSAGES.FIELD_REQUIRED),
  bdaPercentage: z
    .number({ invalid_type_error: ERROR_MESSAGES.INVALID_PERCENTAGE })
    .min(0, ERROR_MESSAGES.INVALID_PERCENTAGE)
    .max(100, ERROR_MESSAGES.INVALID_PERCENTAGE),
  notes: z.string().nullable().optional(),
})

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>
