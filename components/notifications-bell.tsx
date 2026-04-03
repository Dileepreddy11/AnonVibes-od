'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationsPopup } from './notifications-popup'
import { useState } from 'react'
import { useNotifications } from '@/hooks/use-notifications'

export function NotificationsBell() {
  const [showPopup, setShowPopup] = useState(false)
  const { isEnabled, notifications } = useNotifications()

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPopup(!showPopup)}
        className="relative p-2 transition-all duration-300 hover:scale-105"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-muted-foreground hover:text-primary" />
        {isEnabled && unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        )}
      </Button>

      <NotificationsPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
      />
    </>
  )
}
