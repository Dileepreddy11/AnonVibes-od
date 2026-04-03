'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/use-notifications'
import { useAuthContext } from './auth-provider'
import {
  requestNotificationPermission,
  getNotificationPermission,
  getNotificationPreference,
  saveNotificationPreference,
} from '@/lib/push-notification-manager'
import {
  subscribeToPush,
  unsubscribeFromPush,
  supportsPushNotifications,
} from '@/lib/push-subscription-manager'
import { cn } from '@/lib/utils'

export function NotificationsPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuthContext()
  const { isEnabled, toggleNotifications } = useNotifications()
  const [mounted, setMounted] = useState(false)
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | null>(null)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)
  const [supportsPush, setSupportsPush] = useState(false)

  useEffect(() => {
    setMounted(true)
    const permission = getNotificationPermission()
    setBrowserPermission(permission || null)
    setSupportsPush(supportsPushNotifications())
  }, [])

  const handleToggleNotifications = async () => {
    if (!isEnabled) {
      // Turning ON notifications
      console.log('[v0] User attempting to enable notifications')
      setIsRequestingPermission(true)
      const granted = await requestNotificationPermission()
      setIsRequestingPermission(false)

      if (granted) {
        console.log('[v0] Notification permission granted, saving preference and enabling notifications')
        saveNotificationPreference(true)
        toggleNotifications(true)
        setBrowserPermission('granted')
        
        // Subscribe to push notifications if supported
        if (supportsPush && user?.uid) {
          console.log('[v0] Subscribing to Web Push API')
          const subscribed = await subscribeToPush(user.uid)
          if (subscribed) {
            console.log('[v0] Successfully subscribed to push notifications')
          }
        }
        
        // Dispatch storage event to notify other components
        window.dispatchEvent(new Event('storage'))
      } else {
        console.warn('[v0] Notification permission denied - check browser settings')
        setBrowserPermission('denied')
      }
    } else {
      // Turning OFF notifications
      console.log('[v0] User disabling notifications')
      saveNotificationPreference(false)
      toggleNotifications(false)
      
      // Unsubscribe from push notifications
      if (user?.uid) {
        console.log('[v0] Unsubscribing from Web Push API')
        await unsubscribeFromPush(user.uid)
      }
      
      // Dispatch storage event to notify other components
      window.dispatchEvent(new Event('storage'))
    }
  }

  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Popup */}
      <div
        className={cn(
          'fixed right-2 top-20 z-50 w-80 rounded-lg border bg-background shadow-lg transition-all duration-300',
          isOpen ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Notifications</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-4">
          {/* Toggle Section */}
          <div className="mb-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Get real-time notifications about posts, comments, and reactions.
            </p>
            <Button
              onClick={handleToggleNotifications}
              disabled={isRequestingPermission}
              className={cn(
                'w-full transition-all',
                isEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              )}
            >
              {isRequestingPermission
                ? 'Requesting permission...'
                : isEnabled
                  ? 'Turn Off Notifications'
                  : 'Turn On Notifications'}
            </Button>
          </div>

          {/* Permission Status */}
          {browserPermission === 'denied' && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-600 dark:text-red-400">
                Notification permission was denied. Check your browser settings to enable notifications.
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="border-t mb-4" />

          {/* Info Section */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">You&apos;ll receive notifications for:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-primary">📝</span>
                  <span>New posts in the community</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">💬</span>
                  <span>Comments on your posts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">❤️</span>
                  <span>Reactions and engagement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="border-t bg-secondary/20 p-3">
          <p className="text-xs text-muted-foreground text-center">
            Real-time notifications appear even when you&apos;re away from the app
          </p>
        </div>
      </div>
    </>
  )
}
