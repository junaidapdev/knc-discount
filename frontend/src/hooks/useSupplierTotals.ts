import { useMemo } from 'react'
import type { IPurchaseOrderWithSupplier } from '../interfaces/IPurchaseOrder'
import type { ISupplier } from '../interfaces/ISupplier'
import { computeSupplierBDA, type BDAResult } from '../lib/bdaCalculator'
import type { BDACategory } from '../constants/bdaRules'

export interface SupplierTotal {
  supplier: ISupplier
  totalPurchases: number
  bda: BDAResult
}

/**
 * Aggregates purchase orders per supplier for the given period,
 * then runs each through the BDA calculator.
 */
export function useSupplierTotals(
  orders: IPurchaseOrderWithSupplier[],
  suppliers: ISupplier[],
): SupplierTotal[] {
  return useMemo(() => {
    const purchasesBySupplier = new Map<string, number>()

    for (const order of orders) {
      const current = purchasesBySupplier.get(order.supplier_id) ?? 0
      purchasesBySupplier.set(order.supplier_id, current + order.purchase_amount)
    }

    return suppliers.map((supplier) => {
      const totalPurchases = purchasesBySupplier.get(supplier.id) ?? 0
      const period = supplier.bda_category as BDACategory
      const bda = computeSupplierBDA(totalPurchases, supplier.rebate_rules, period)

      return { supplier, totalPurchases, bda }
    })
  }, [orders, suppliers])
}
