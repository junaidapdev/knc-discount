import { createContext, useState, type ReactNode } from 'react'
import { ROLES, type Role } from '../constants/roles'

interface AuthContextValue {
  role: Role
  setRole: (role: Role) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(ROLES.ACCOUNTS)

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      {children}
    </AuthContext.Provider>
  )
}
