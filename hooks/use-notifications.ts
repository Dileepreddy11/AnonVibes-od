import { useState, useEffect, useCallback } from 'react'
import { getNotificationPreference, saveNotificationPreference } from '@/lib/push-notification-manager'

export type NotificationType = 'post' | 'comment' | 'reaction'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  timestamp: Date
  read: boolean
}

const NOTIFICATION_MESSAGES = {
  post: [
    "What's on your mind? Someone just shared their thoughts 💭",
    'A new vibe just dropped! Check it out',
    "New mood on the wall! See what's being shared",
    'Someone shared a moment anonymously 🤔',
  ],
  comment: [
    'Someone responded to a post! 💬',
    'Your post got a comment! 👀',
    'New comment on the discussion! 💭',
    'Someone has something to say! 📢',
  ],
  reaction: [
    'Your post resonated with someone! ❤️',
    'Someone loved your post! 💕',
    'Your vibe got a reaction! 😊',
    'Your post touched someone! ✨',
  ],
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isEnabled, setIsEnabled] = useState(false)

  // Load preferences from localStorage and sync with preference manager
  useEffect(() => {
    const stored = getNotificationPreference()
    setIsEnabled(stored)
  }, [])

  // Toggle notifications and save preference
  const toggleNotifications = useCallback((enabled: boolean) => {
    setIsEnabled(enabled)
    saveNotificationPreference(enabled)
  }, [])

  // Add a new notification (called by real-time listeners)
  const addNotification = useCallback((type: NotificationType) => {
    if (!isEnabled) return

    const messages = NOTIFICATION_MESSAGES[type]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message: randomMessage,
      timestamp: new Date(),
      read: false,
    }

    setNotifications(prev => [notification, ...prev])

    // Remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }, [isEnabled])

  return {
    notifications,
    isEnabled,
    toggleNotifications,
    addNotification,
  }
}
