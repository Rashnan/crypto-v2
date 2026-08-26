import { useState, type ReactNode } from 'react'
import { AuthContext, devUser } from './auth'

const storageKey = 'crypto-authenticated'

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(storageKey) === 'true',
  )

  function login(email: string, password: string) {
    if (email !== devUser.email || password !== devUser.password) {
      return false
    }

    localStorage.setItem(storageKey, 'true')
    setIsAuthenticated(true)
    return true
  }

  function logout() {
    localStorage.removeItem(storageKey)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
