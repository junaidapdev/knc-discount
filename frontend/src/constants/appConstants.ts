export const APP_NAME = 'KNC Discount'

export const TAB_LABELS = {
  PURCHASES: 'Purchases',
  AUDIT: 'Audit',
  ANALYTICS: 'Analytics',
} as const

export const ROUTES = {
  PURCHASES: '/',
  AUDIT: '/audit',
  ANALYTICS: '/analytics',
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
} as const

export const DATE_FORMAT = 'dd MMM yyyy' as const

export const CURRENCY = {
  CODE: 'SR',
  LOCALE: 'en-SA',
  SYMBOL: 'SR',
} as const

export const NOTES_MAX_LENGTH = 500 as const

export const REBATE_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const

export const CREDIT_NOTE_STATUS = {
  OPEN: 'open',
  APPLIED: 'applied',
  CANCELLED: 'cancelled',
} as const
