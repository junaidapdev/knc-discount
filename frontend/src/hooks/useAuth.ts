import { useContext } from 'react'
import { AuthContext } from '../routes/AuthContext'
import { ROLES, type Role } from '../constants/roles'

export interface AuthState {
  role: Role
  canEdit: boolean
  setRole: (role: Role) => void
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return {
    role: ctx.role,
    canEdit: ctx.role === ROLES.ACCOUNTS,
    setRole: ctx.setRole,
  }
}
