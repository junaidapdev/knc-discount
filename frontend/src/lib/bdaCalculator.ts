import type { IBDARules } from '../interfaces/IBDARules'
import { BDA_REBATE_KEY, BDA_RENT_KEY, type BDACategory } from '../constants/bdaRules'

export interface GalaxyIncentiveResult {
  eligible: boolean
  incentiveAmount: number
}

export interface BDABreakdown {
  rebate: number
  rent: number
}

export interface BDAResult {
  expectedRebate: number
  percentage: number
  targetMet: boolean
  breakdown: BDABreakdown
}

/**
 * Calculates the rebate amount from total purchases and a rebate percentage.
 */
export function calculateRebate(totalPurchases: number, rebatePercent: number): number {
  if (totalPurchases <= 0 || rebatePercent <= 0) return 0
  return Math.round(totalPurchases * rebatePercent) / 100
}

/**
 * Calculates the rent deduction from total purchases and a rent percentage.
 */
export function calculateRent(totalPurchases: number, rentPercent: number): number {
  if (totalPurchases <= 0 || rentPercent <= 0) return 0
  return Math.round(totalPurchases * rentPercent) / 100
}

/**
 * Calculates a Galaxy-style target-based incentive.
 * Returns eligibility and the incentive amount (0 when not eligible).
 */
export function calculateGalaxyIncentive(
  totalPurchases: number,
  target: number,
  incentivePercent: number,
): GalaxyIncentiveResult {
  if (target <= 0 || incentivePercent <= 0) {
    return { eligible: false, incentiveAmount: 0 }
  }
  const eligible = totalPurchases >= target
  return {
    eligible,
    incentiveAmount: eligible ? Math.round(totalPurchases * incentivePercent) / 100 : 0,
  }
}

/**
 * Computes the full BDA breakdown for a supplier over a given period.
 *
 * Reads the rebate percentage for the requested period from the
 * supplier's rebate_rules JSONB and combines it with rent to
 * produce the total expected rebate.
 */
export function computeSupplierBDA(
  totalPurchases: number,
  rules: IBDARules,
  period: BDACategory,
): BDAResult {
  const rebateKey = BDA_REBATE_KEY[period]
  const rebatePercent: number = (rules as Record<string, number | undefined>)[rebateKey] ?? 0
  const rentPercent: number = rules[BDA_RENT_KEY] ?? 0

  const rebate = calculateRebate(totalPurchases, rebatePercent)
  const rent = calculateRent(totalPurchases, rentPercent)

  const target = rules.monthly_target ?? rules.yearly_target ?? 0
  const targetMet = target > 0 && totalPurchases >= target

  return {
    expectedRebate: rebate + rent,
    percentage: rebatePercent + rentPercent,
    targetMet,
    breakdown: { rebate, rent },
  }
}
