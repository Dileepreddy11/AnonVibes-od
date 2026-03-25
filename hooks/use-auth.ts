'use client'

import { useState, useEffect, useCallback } from 'react'
import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { getOrCreateUsername } from '@/lib/username'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const signIn = useCallback(async () => {
    try {
      setError(null)
      await signInAnonymously(auth)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setUsername(getOrCreateUsername())
      } else {
        // Auto sign in anonymously
        try {
          await signInAnonymously(auth)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to authenticate')
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return {
    user,
    username,
    loading,
    error,
    signIn,
    isAuthenticated: !!user,
  }
}
