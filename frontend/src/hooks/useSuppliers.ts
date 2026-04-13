import { useEffect, useState, useCallback } from 'react'
import supabase from '../lib/supabaseClient'
import { successResponse, errorResponse, type ApiResponse } from '../lib/apiResponse'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import { HTTP_STATUS } from '../constants/httpStatusCodes'
import type { ISupplier } from '../interfaces/ISupplier'
import type { SupplierFormData } from '../validations/supplierSchema'
import type { IBDARules } from '../interfaces/IBDARules'
import logger from '../lib/logger'

export type SupplierCreateData = Omit<SupplierFormData, 'monthly_rebate' | 'quarterly_rebate' | 'yearly_rebate' | 'yearly_combined' | 'rent_percent' | 'monthly_target' | 'yearly_target'> & {
  rebate_rules: IBDARules
}

function formDataToSupplier(data: SupplierFormData): { name: string; bda_category: string; target_amount: number | null; rebate_rules: IBDARules } {
  const rebate_rules: IBDARules = {}
  if (data.monthly_rebate != null) rebate_rules.monthly_rebate = data.monthly_rebate
  if (data.quarterly_rebate != null) rebate_rules.quarterly_rebate = data.quarterly_rebate
  if (data.yearly_rebate != null) rebate_rules.yearly_rebate = data.yearly_rebate
  if (data.yearly_combined != null) rebate_rules.yearly_combined = data.yearly_combined
  if (data.rent_percent != null) rebate_rules.rent_percent = data.rent_percent
  if (data.monthly_target != null) rebate_rules.monthly_target = data.monthly_target
  if (data.yearly_target != null) rebate_rules.yearly_target = data.yearly_target

  return {
    name: data.name,
    bda_category: data.bda_category,
    target_amount: data.target_amount ?? null,
    rebate_rules,
  }
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await fetchSuppliers()
    if (result.success && result.data) {
      setSuppliers(result.data)
      setError(null)
    } else {
      setError(result.error ?? ERROR_MESSAGES.UNKNOWN)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchSuppliers().then((result) => {
      if (cancelled) return
      if (result.success && result.data) {
        setSuppliers(result.data)
        setError(null)
      } else {
        setError(result.error ?? ERROR_MESSAGES.UNKNOWN)
      }
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const create = useCallback(async (data: SupplierFormData): Promise<ApiResponse<ISupplier>> => {
    const payload = formDataToSupplier(data)
    const { data: row, error: err } = await supabase
      .from('suppliers')
      .insert(payload)
      .select()
      .single()

    if (err) {
      logger.error('createSupplier', err)
      return errorResponse(ERROR_MESSAGES.SUPPLIER_CREATE_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    const supplier = row as ISupplier
    setSuppliers((prev) => [...prev, supplier].sort((a, b) => a.name.localeCompare(b.name)))
    return successResponse(supplier, HTTP_STATUS.CREATED)
  }, [])

  const update = useCallback(async (id: string, data: SupplierFormData): Promise<ApiResponse<ISupplier>> => {
    const payload = formDataToSupplier(data)
    const { data: row, error: err } = await supabase
      .from('suppliers')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (err) {
      logger.error('updateSupplier', err)
      return errorResponse(ERROR_MESSAGES.SUPPLIER_UPDATE_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    const supplier = row as ISupplier
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? supplier : s)).sort((a, b) => a.name.localeCompare(b.name))
    )
    return successResponse(supplier)
  }, [])

  const remove = useCallback(async (id: string): Promise<ApiResponse<null>> => {
    const { error: err } = await supabase.from('suppliers').delete().eq('id', id)

    if (err) {
      logger.error('deleteSupplier', err)
      return errorResponse(ERROR_MESSAGES.SUPPLIER_DELETE_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    }

    setSuppliers((prev) => prev.filter((s) => s.id !== id))
    return successResponse(null)
  }, [])

  return { suppliers, loading, error, load, create, update, remove }
}

async function fetchSuppliers(): Promise<ApiResponse<ISupplier[]>> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')

  if (error) {
    logger.error('fetchSuppliers', error)
    return errorResponse(ERROR_MESSAGES.SUPPLIER_LOAD_FAILED)
  }

  return successResponse(data as ISupplier[])
}
