import { useCallback, useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'
import { successResponse, errorResponse, type ApiResponse } from '../lib/apiResponse'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import { HTTP_STATUS } from '../constants/httpStatusCodes'
import type { ICreditNote, ICreditNoteWithSupplier } from '../interfaces/ICreditNote'
import type { ISupplier } from '../interfaces/ISupplier'
import type { IPurchaseOrder } from '../interfaces/IPurchaseOrder'
import { computeSupplierBDA } from '../lib/bdaCalculator'
import type { BDACategory } from '../constants/bdaRules'
import logger from '../lib/logger'

export interface CreditNoteCreateData {
  supplier_id: string
  period_start: string
  period_end: string
  received_amount: number
  status: 'pending' | 'received' | 'disputed'
}

export function useCreditNotes() {
  const [creditNotes, setCreditNotes] = useState<ICreditNoteWithSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await fetchCreditNotes()
    if (result.success && result.data) {
      setCreditNotes(result.data)
      setError(null)
    } else {
      setError(result.error ?? ERROR_MESSAGES.UNKNOWN)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (
    formData: CreditNoteCreateData,
    suppliers: ISupplier[],
  ): Promise<ApiResponse<ICreditNote>> => {
    const supplier = suppliers.find((s) => s.id === formData.supplier_id)
    if (!supplier) return errorResponse(ERROR_MESSAGES.NOT_FOUND)

    const expectedAmount = await calculateExpectedForPeriod(
      formData.supplier_id,
      formData.period_start,
      formData.period_end,
      supplier,
    )

    const result = await createCreditNote({
      ...formData,
      expected_amount: expectedAmount,
    })
    if (result.success) await load()
    return result
  }, [load])

  const update = useCallback(async (
    id: string,
    data: Partial<CreditNoteCreateData>,
  ): Promise<ApiResponse<ICreditNote>> => {
    const result = await updateCreditNote(id, data)
    if (result.success) await load()
    return result
  }, [load])

  return { creditNotes, loading, error, create, update, reload: load }
}

/**
 * Calculates expected rebate for a supplier in a date range
 * by summing purchases and running them through the BDA calculator.
 */
async function calculateExpectedForPeriod(
  supplierId: string,
  periodStart: string,
  periodEnd: string,
  supplier: ISupplier,
): Promise<number> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('purchase_amount')
    .eq('supplier_id', supplierId)
    .gte('order_date', periodStart)
    .lte('order_date', periodEnd)

  if (error) {
    logger.error('calculateExpectedForPeriod', error)
    return 0
  }

  const totalPurchases = (data as Pick<IPurchaseOrder, 'purchase_amount'>[])
    .reduce((sum, row) => sum + row.purchase_amount, 0)

  const period = supplier.bda_category as BDACategory
  const bda = computeSupplierBDA(totalPurchases, supplier.rebate_rules, period)
  return bda.expectedRebate
}

/**
 * Fetches purchase total for a supplier in a date range.
 * Exposed so CreditNoteModal can show purchase totals before saving.
 */
export async function fetchPeriodPurchaseTotal(
  supplierId: string,
  periodStart: string,
  periodEnd: string,
): Promise<number> {
  const { data, error } = await supabase
    .from('purchase_orders')
    .select('purchase_amount')
    .eq('supplier_id', supplierId)
    .gte('order_date', periodStart)
    .lte('order_date', periodEnd)

  if (error) {
    logger.error('fetchPeriodPurchaseTotal', error)
    return 0
  }

  return (data as Pick<IPurchaseOrder, 'purchase_amount'>[])
    .reduce((sum, row) => sum + row.purchase_amount, 0)
}

async function fetchCreditNotes(): Promise<ApiResponse<ICreditNoteWithSupplier[]>> {
  const { data, error } = await supabase
    .from('credit_notes')
    .select('*, suppliers(name)')
    .order('period_end', { ascending: false })

  if (error) {
    logger.error('fetchCreditNotes', error)
    return errorResponse(ERROR_MESSAGES.AUDIT_LOAD_FAILED)
  }

  return successResponse(data as ICreditNoteWithSupplier[])
}

async function createCreditNote(
  payload: CreditNoteCreateData & { expected_amount: number },
): Promise<ApiResponse<ICreditNote>> {
  const { data, error } = await supabase
    .from('credit_notes')
    .insert({
      supplier_id: payload.supplier_id,
      period_start: payload.period_start,
      period_end: payload.period_end,
      expected_amount: payload.expected_amount,
      received_amount: payload.received_amount,
      status: payload.status,
    })
    .select()
    .single()

  if (error) {
    logger.error('createCreditNote', error)
    return errorResponse(ERROR_MESSAGES.CREDIT_NOTE_CREATE_FAILED)
  }

  return successResponse(data as ICreditNote, HTTP_STATUS.CREATED)
}

async function updateCreditNote(
  id: string,
  data: Partial<CreditNoteCreateData>,
): Promise<ApiResponse<ICreditNote>> {
  const { data: row, error } = await supabase
    .from('credit_notes')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logger.error('updateCreditNote', error)
    return errorResponse(ERROR_MESSAGES.CREDIT_NOTE_UPDATE_FAILED)
  }

  return successResponse(row as ICreditNote)
}
