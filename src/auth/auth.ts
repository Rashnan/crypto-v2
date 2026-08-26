import { createContext, useContext } from 'react'

interface AuthContextValue {
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

export const devUser = {
  email: 'dev@crypto.local',
  password: 'dev1234',
} as const

export const loginDisabled = import.meta.env.VITE_NO_LOGIN === 'true'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
