import { HTTP_STATUS } from '../constants/httpStatusCodes'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code: number
}

export function successResponse<T>(data: T, code = HTTP_STATUS.OK): ApiResponse<T> {
  return { success: true, data, code }
}

export function errorResponse<T>(error: string, code = HTTP_STATUS.INTERNAL_SERVER_ERROR): ApiResponse<T> {
  return { success: false, error, code }
}
