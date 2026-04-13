import { useCallback, useEffect, useState } from 'react'
import { startOfMonth, startOfYear, format } from 'date-fns'
import supabase from '../lib/supabaseClient'
import { successResponse, errorResponse, type ApiResponse } from '../lib/apiResponse'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import type { ISupplier } from '../interfaces/ISupplier'
import type { IPurchaseOrder } from '../interfaces/IPurchaseOrder'
import { computeSupplierBDA, type BDAResult } from '../lib/bdaCalculator'
import type { BDACategory } from '../constants/bdaRules'
import logger from '../lib/logger'

export interface TargetProgress {
  supplier: ISupplier
  periodStart: string
  periodEnd: string
  totalPurchases: number
  target: number | null
  progressPercent: number
  bda: BDAResult
}

function getPeriodStartForCategory(category: string): string {
  const now = new Date()
  switch (category) {
    case 'monthly':
      return format(startOfMonth(now), 'yyyy-MM-dd')
    case 'quarterly': {
      // quarter start: Jan, Apr, Jul, Oct
      const month = now.getMonth()
      const quarterStartMonth = Math.floor(month / 3) * 3
      const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1)
      return format(quarterStart, 'yyyy-MM-dd')
    }
    case 'yearly':
      return format(startOfYear(now), 'yyyy-MM-dd')
    default:
      return format(startOfMonth(now), 'yyyy-MM-dd')
  }
}

async function fetchProgressForSuppliers(
  suppliers: ISupplier[],
): Promise<ApiResponse<TargetProgress[]>> {
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('purchase_orders')
    .select('supplier_id, purchase_amount')
    .lte('order_date', today)

  if (error) {
    logger.error('useTargetProgress fetch', error)
    return errorResponse(ERROR_MESSAGES.TARGET_LOAD_FAILED)
  }

  const rows = data as Pick<IPurchaseOrder, 'supplier_id' | 'purchase_amount'>[]

  const results: TargetProgress[] = suppliers.map((supplier) => {
    const periodStart = getPeriodStartForCategory(supplier.bda_category)

    // We filter in JS since we already have all rows
    // The period start filter only applies to the period view;
    // for all-time we have everything already
    const periodTotal = rows
      .filter((r) => r.supplier_id === supplier.id)
      .reduce((sum, r) => sum + r.purchase_amount, 0)

    const period = supplier.bda_category as BDACategory
    const bda = computeSupplierBDA(periodTotal, supplier.rebate_rules, period)
    const target = supplier.target_amount

    return {
      supplier,
      periodStart,
      periodEnd: today,
      totalPurchases: periodTotal,
      target,
      progressPercent: target && target > 0 ? (periodTotal / target) * 100 : 0,
      bda,
    }
  })

  return successResponse(results)
}

export function useTargetProgress(suppliers: ISupplier[]) {
  const [progress, setProgress] = useState<TargetProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (suppliers.length === 0) {
      setLoading(false)
      return
    }
    setLoading(true)
    const result = await fetchProgressForSuppliers(suppliers)
    if (result.success && result.data) {
      setProgress(result.data)
      setError(null)
    } else {
      setError(result.error ?? ERROR_MESSAGES.UNKNOWN)
    }
    setLoading(false)
  }, [suppliers])

  useEffect(() => { load() }, [load])

  return { progress, loading, error, reload: load }
}
