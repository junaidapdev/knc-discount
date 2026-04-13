import { useEffect, useState } from 'react'
import supabase from '../lib/supabaseClient'
import { successResponse, errorResponse, type ApiResponse } from '../lib/apiResponse'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import type { ISupplier } from '../interfaces/ISupplier'
import logger from '../lib/logger'

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetch() {
      setLoading(true)
      const result = await fetchSuppliers()
      if (cancelled) return

      if (result.success && result.data) {
        setSuppliers(result.data)
        setError(null)
      } else {
        setError(result.error ?? ERROR_MESSAGES.UNKNOWN)
      }
      setLoading(false)
    }

    fetch()
    return () => { cancelled = true }
  }, [])

  return { suppliers, loading, error }
}

async function fetchSuppliers(): Promise<ApiResponse<ISupplier[]>> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')

  if (error) {
    logger.error('fetchSuppliers', error)
    return errorResponse(ERROR_MESSAGES.UNKNOWN)
  }

  return successResponse(data as ISupplier[])
}
