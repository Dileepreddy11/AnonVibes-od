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
          console.log('[v0] Notifications system initialized with service worker')
        } else {
          console.log('[v0] Service worker registration returned null, but notifications may still work')
        }
      } catch (error) {
        console.error('[v0] Failed to initialize notifications:', error)
      }
    }

    initializeServiceWorker()
  }, [])

  // Set up real-time event listeners (this will check preference and listen for changes)
  useRealtimeEvents(user?.uid || null)

  return null
}
