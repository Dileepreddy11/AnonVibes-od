// Notification Initializer - Sets up service worker and real-time listeners on app load
'use client'

import { useEffect } from 'react'
import { useAuthContext } from './auth-provider'
import { registerServiceWorker } from '@/lib/push-notification-manager'
import { useRealtimeEvents } from '@/hooks/use-realtime-events'

export function NotificationInitializer() {
  const { user } = useAuthContext()

  // Initialize service worker once on mount
  useEffect(() => {
    const initializeServiceWorker = async () => {
      try {
        const registration = await registerServiceWorker()
        if (registration) {
          console.log('Notifications system initialized')
        }
      } catch (error) {
        console.error('Failed to initialize notifications:', error)
      }
    }

    initializeServiceWorker()
  }, [])

  // Set up real-time event listeners
  useRealtimeEvents(user?.uid || null)

  return null
}
