import { describe, it, expect } from 'vitest'
import {
  calculateRebate,
  calculateRent,
  calculateGalaxyIncentive,
  computeSupplierBDA,
} from '../bdaCalculator'
import type { IBDARules } from '../../interfaces/IBDARules'

// -----------------------------------------------------------
// calculateRebate
// -----------------------------------------------------------
describe('calculateRebate', () => {
  it('calculates rebate correctly for normal inputs', () => {
    expect(calculateRebate(100_000, 3)).toBe(3000)
  })

  it('returns 0 when total purchases is 0', () => {
    expect(calculateRebate(0, 5)).toBe(0)
  })

  it('returns 0 when rebate percent is 0', () => {
    expect(calculateRebate(50_000, 0)).toBe(0)
  })

  it('returns 0 for negative total purchases', () => {
    expect(calculateRebate(-1000, 3)).toBe(0)
  })

  it('returns 0 for negative percent', () => {
    expect(calculateRebate(10_000, -2)).toBe(0)
  })

  it('handles small fractional amounts', () => {
    expect(calculateRebate(333, 1)).toBe(3.33)
  })
})

// -----------------------------------------------------------
// calculateRent
// -----------------------------------------------------------
describe('calculateRent', () => {
  it('calculates rent correctly for normal inputs', () => {
    expect(calculateRent(100_000, 1.5)).toBe(1500)
  })

  it('returns 0 when total purchases is 0', () => {
    expect(calculateRent(0, 1.5)).toBe(0)
  })

  it('returns 0 when rent percent is 0', () => {
    expect(calculateRent(50_000, 0)).toBe(0)
  })
})

// -----------------------------------------------------------
// calculateGalaxyIncentive
// -----------------------------------------------------------
describe('calculateGalaxyIncentive', () => {
  it('returns eligible + incentive when target is met', () => {
    const result = calculateGalaxyIncentive(120_000, 115_000, 3)
    expect(result.eligible).toBe(true)
    expect(result.incentiveAmount).toBe(3600)
  })

  it('returns eligible when purchases exactly equal target', () => {
    const result = calculateGalaxyIncentive(115_000, 115_000, 3)
    expect(result.eligible).toBe(true)
    expect(result.incentiveAmount).toBe(3450)
  })

  it('returns not eligible when below target', () => {
    const result = calculateGalaxyIncentive(100_000, 115_000, 3)
    expect(result.eligible).toBe(false)
    expect(result.incentiveAmount).toBe(0)
  })

  it('returns not eligible for zero target', () => {
    const result = calculateGalaxyIncentive(100_000, 0, 3)
    expect(result.eligible).toBe(false)
    expect(result.incentiveAmount).toBe(0)
  })

  it('returns not eligible for zero incentive percent', () => {
    const result = calculateGalaxyIncentive(120_000, 115_000, 0)
    expect(result.eligible).toBe(false)
    expect(result.incentiveAmount).toBe(0)
  })

  it('handles zero purchases', () => {
    const result = calculateGalaxyIncentive(0, 115_000, 3)
    expect(result.eligible).toBe(false)
    expect(result.incentiveAmount).toBe(0)
  })
})

// -----------------------------------------------------------
// computeSupplierBDA
// -----------------------------------------------------------
describe('computeSupplierBDA', () => {
  const teaShopRules: IBDARules = {
    quarterly_rebate: 2,
    rent_percent: 1.5,
  }

  const gandourRules: IBDARules = {
    monthly_rebate: 1,
    quarterly_rebate: 1.5,
  }

  const galaxyRules: IBDARules = {
    monthly_rebate: 3,
    yearly_combined: 3.25,
    monthly_target: 115_000,
    yearly_target: 150_000,
  }

  it('computes Tea Shop quarterly BDA correctly', () => {
    const result = computeSupplierBDA(80_000, teaShopRules, 'quarterly')
    expect(result.percentage).toBe(3.5) // 2 + 1.5
    expect(result.breakdown.rebate).toBe(1600) // 80k * 2%
    expect(result.breakdown.rent).toBe(1200) // 80k * 1.5%
    expect(result.expectedRebate).toBe(2800) // 1600 + 1200
    expect(result.targetMet).toBe(false) // no target set
  })

  it('computes Gandour monthly BDA correctly', () => {
    const result = computeSupplierBDA(40_000, gandourRules, 'monthly')
    expect(result.percentage).toBe(1) // 1 + 0 rent
    expect(result.breakdown.rebate).toBe(400)
    expect(result.breakdown.rent).toBe(0)
    expect(result.expectedRebate).toBe(400)
  })

  it('computes Gandour quarterly BDA correctly', () => {
    const result = computeSupplierBDA(120_000, gandourRules, 'quarterly')
    expect(result.percentage).toBe(1.5)
    expect(result.breakdown.rebate).toBe(1800)
    expect(result.expectedRebate).toBe(1800)
  })

  it('computes Galaxy with target met', () => {
    const result = computeSupplierBDA(120_000, galaxyRules, 'monthly')
    expect(result.percentage).toBe(3)
    expect(result.breakdown.rebate).toBe(3600)
    expect(result.targetMet).toBe(true)
  })

  it('computes Galaxy with target not met', () => {
    const result = computeSupplierBDA(100_000, galaxyRules, 'monthly')
    expect(result.percentage).toBe(3)
    expect(result.breakdown.rebate).toBe(3000)
    expect(result.targetMet).toBe(false)
  })

  it('returns zeros for zero purchases', () => {
    const result = computeSupplierBDA(0, teaShopRules, 'quarterly')
    expect(result.expectedRebate).toBe(0)
    expect(result.percentage).toBe(3.5)
    expect(result.targetMet).toBe(false)
  })

  it('returns zero rebate for missing period key', () => {
    const result = computeSupplierBDA(50_000, teaShopRules, 'monthly')
    // Tea Shop has no monthly_rebate key
    expect(result.breakdown.rebate).toBe(0)
    expect(result.breakdown.rent).toBe(750)
    expect(result.expectedRebate).toBe(750) // rent only
  })
})
