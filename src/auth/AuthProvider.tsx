import { useMemo, useState, type ReactNode } from 'react'
import { AuthContext, devUser, loginDisabled } from './auth'

const storageKey = 'crypto-authenticated'

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => loginDisabled || localStorage.getItem(storageKey) === 'true',
  )

  const value = useMemo(() => {
    function login(email: string, password: string) {
      if (loginDisabled) return true

      if (email !== devUser.email || password !== devUser.password) {
        return false
      }

      localStorage.setItem(storageKey, 'true')
      setIsAuthenticated(true)
      return true
    }

    function logout() {
      if (loginDisabled) return

      localStorage.removeItem(storageKey)
      setIsAuthenticated(false)
    }

    return { isAuthenticated: loginDisabled || isAuthenticated, login, logout }
  }, [isAuthenticated])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
