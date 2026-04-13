import { z } from 'zod'
import { BDA_CATEGORIES } from '../constants/bdaRules'

export const supplierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  bda_category: z.enum(BDA_CATEGORIES, { errorMap: () => ({ message: 'BDA category is required' }) }),
  target_amount: z
    .number({ invalid_type_error: 'Target must be a number' })
    .positive('Target must be positive')
    .nullable()
    .optional(),
  monthly_rebate: z.number().min(0).max(100).nullable().optional(),
  quarterly_rebate: z.number().min(0).max(100).nullable().optional(),
  yearly_rebate: z.number().min(0).max(100).nullable().optional(),
  yearly_combined: z.number().min(0).max(100).nullable().optional(),
  rent_percent: z.number().min(0).max(100).nullable().optional(),
  monthly_target: z.number().min(0).nullable().optional(),
  yearly_target: z.number().min(0).nullable().optional(),
})

export type SupplierFormData = z.infer<typeof supplierSchema>
