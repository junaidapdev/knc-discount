export const ROLES = {
  ACCOUNTS: 'accounts',
  PURCHASE_MANAGER: 'purchase_manager',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
