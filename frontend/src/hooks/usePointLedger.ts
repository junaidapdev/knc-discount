import { useCallback, useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'
import { successResponse, errorResponse, type ApiResponse } from '../lib/apiResponse'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import { HTTP_STATUS } from '../constants/httpStatusCodes'
import type { IPointsLedger, IPointsLedgerWithSupplier } from '../interfaces/IPointsLedger'
import type { PointFormValues } from '../validations/pointSchema'
import logger from '../lib/logger'

export function usePointLedger() {
  const [entries, setEntries] = useState<IPointsLedgerWithSupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await fetchPointLedger()
    if (result.success && result.data) {
      setEntries(result.data)
      setError(null)
    } else {
      setError(result.error ?? ERROR_MESSAGES.UNKNOWN)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const create = useCallback(async (data: PointFormValues): Promise<ApiResponse<IPointsLedger>> => {
    const result = await createPointEntry(data)
    if (result.success) await load()
    return result
  }, [load])

  const update = useCallback(async (id: string, data: Partial<PointFormValues>): Promise<ApiResponse<IPointsLedger>> => {
    const result = await updatePointEntry(id, data)
    if (result.success) await load()
    return result
  }, [load])

  const remove = useCallback(async (id: string): Promise<ApiResponse<null>> => {
    const result = await deletePointEntry(id)
    if (result.success) await load()
    return result
  }, [load])

  return { entries, loading, error, create, update, remove, reload: load }
}

async function fetchPointLedger(): Promise<ApiResponse<IPointsLedgerWithSupplier[]>> {
  const { data, error } = await supabase
    .from('point_ledger')
    .select('*, suppliers(name)')
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('fetchPointLedger', error)
    return errorResponse(ERROR_MESSAGES.POINTS_LOAD_FAILED)
  }

  return successResponse(data as IPointsLedgerWithSupplier[])
}

async function createPointEntry(data: PointFormValues): Promise<ApiResponse<IPointsLedger>> {
  const { data: row, error } = await supabase
    .from('point_ledger')
    .insert({
      supplier_id: data.supplier_id,
      item_description: data.item_description,
      points_earned: data.points_earned,
      redeemed: data.redeemed,
      redeemed_for: data.redeemed_for,
    })
    .select()
    .single()

  if (error) {
    logger.error('createPointEntry', error)
    return errorResponse(ERROR_MESSAGES.POINTS_CREATE_FAILED)
  }

  return successResponse(row as IPointsLedger, HTTP_STATUS.CREATED)
}

async function updatePointEntry(id: string, data: Partial<PointFormValues>): Promise<ApiResponse<IPointsLedger>> {
  const { data: row, error } = await supabase
    .from('point_ledger')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logger.error('updatePointEntry', error)
    return errorResponse(ERROR_MESSAGES.POINTS_UPDATE_FAILED)
  }

  return successResponse(row as IPointsLedger)
}

async function deletePointEntry(id: string): Promise<ApiResponse<null>> {
  const { error } = await supabase
    .from('point_ledger')
    .delete()
    .eq('id', id)

  if (error) {
    logger.error('deletePointEntry', error)
    return errorResponse(ERROR_MESSAGES.POINTS_DELETE_FAILED)
  }

  return successResponse(null, HTTP_STATUS.NO_CONTENT)
}
