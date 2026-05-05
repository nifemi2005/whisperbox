'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import type { User } from '../types/auth'
import { getStoredUser, clearSession } from '../lib/api'
import { deletePrivateKey } from '../lib/storage'

type AuthContextType = {
  user: User | null

  isLoading: boolean

  setUser: (user: User | null) => void

  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser) {
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const logout = useCallback(async () => {
    if (!user) return

    try {
      await deletePrivateKey(user.id)
    } catch {
      console.error('Failed to delete private key from IndexedDB')
    }

    clearSession()

    setUser(null)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
