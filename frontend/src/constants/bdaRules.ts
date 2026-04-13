export const BDA_CATEGORIES = ['monthly', 'quarterly', 'yearly'] as const
export type BDACategory = (typeof BDA_CATEGORIES)[number]

export const BDA_CATEGORY_LABELS: Record<BDACategory, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
} as const

/**
 * Maps a BDA category to the key used in supplier.rebate_rules JSONB.
 * e.g. 'monthly' → 'monthly_rebate'
 */
export const BDA_REBATE_KEY: Record<BDACategory, string> = {
  monthly: 'monthly_rebate',
  quarterly: 'quarterly_rebate',
  yearly: 'yearly_rebate',
} as const

export const BDA_RENT_KEY = 'rent_percent' as const
