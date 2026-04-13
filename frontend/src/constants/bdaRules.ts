/**
 * BDA (Business Development Allowance) percentage rules per supplier.
 * Keys are supplier codes; values are rebate percentage rates.
 */
export const BDA_RULES: Record<string, number> = {
  DEFAULT: 2.5,
  SUPPLIER_A: 3.0,
  SUPPLIER_B: 5.0,
  SUPPLIER_C: 2.0,
  SUPPLIER_D: 4.5,
} as const

export const BDA_TIERS = {
  BRONZE: { minSpend: 0, rate: 2.5 },
  SILVER: { minSpend: 50_000, rate: 3.5 },
  GOLD: { minSpend: 100_000, rate: 5.0 },
} as const
