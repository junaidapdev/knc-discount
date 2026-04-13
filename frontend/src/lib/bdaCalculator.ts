import { BDA_RULES, BDA_TIERS } from '../constants/bdaRules'

/**
 * Returns the BDA rate for a given supplier code.
 * Falls back to the default rate if the supplier code is not found.
 */
export function getBdaRate(supplierCode: string): number {
  return BDA_RULES[supplierCode] ?? BDA_RULES['DEFAULT'] ?? 0
}

/**
 * Calculates the expected rebate amount given a purchase amount and BDA rate.
 */
export function calculateRebate(purchaseAmount: number, bdaRate: number): number {
  return (purchaseAmount * bdaRate) / 100
}

/**
 * Returns the BDA tier name based on total spend.
 */
export function getBdaTier(totalSpend: number): keyof typeof BDA_TIERS {
  if (totalSpend >= BDA_TIERS.GOLD.minSpend) return 'GOLD'
  if (totalSpend >= BDA_TIERS.SILVER.minSpend) return 'SILVER'
  return 'BRONZE'
}

/**
 * Calculates the variance between expected and received rebate.
 * Positive = under-received, Negative = over-received.
 */
export function calculateVariance(expected: number, received: number): number {
  return expected - received
}
