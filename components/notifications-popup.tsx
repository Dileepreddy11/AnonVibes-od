'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'

export function NotificationsPopup({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { isEnabled, toggleNotifications, notifications } = useNotifications()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
              Get notified about what's happening in the community.
            </p>
            <Button
              onClick={() => toggleNotifications(!isEnabled)}
              className={cn(
                'w-full transition-all',
                isEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              )}
            >
              {isEnabled ? 'Turn Off Notifications' : 'Turn On Notifications'}
            </Button>
          </div>

          {/* Divider */}
          <div className="border-t mb-4" />

          {/* Notifications List */}
          {isEnabled ? (
            notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className="p-3 rounded-lg bg-secondary/30 border border-secondary/50 text-sm space-y-1"
                  >
                    <p className="font-medium text-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No notifications yet. Check back soon!
                </p>
              </div>
            )
          ) : (
            <div className="py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                Notifications are turned off. Turn them on to stay updated!
              </p>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="border-t bg-secondary/20 p-3">
          <p className="text-xs text-muted-foreground text-center">
            You&apos;ll receive hourly notifications about new posts, comments, and reactions.
          </p>
        </div>
      </div>
    </>
  )
}
