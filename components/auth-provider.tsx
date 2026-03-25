'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import type { User } from 'firebase/auth'

interface AuthContextType {
  user: User | null
  username: string
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return <AuthContext value={auth}>{children}</AuthContext>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
