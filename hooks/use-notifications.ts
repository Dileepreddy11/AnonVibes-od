import { useState, useEffect, useCallback } from 'react'

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
    'What\'s on your mind right now?',
    'Something weighing on you? Share it!',
    'What are you feeling today?',
    'Waiting for your thoughts...',
  ],
  comment: [
    'Someone commented on your post!',
    'Your post got a reply!',
    'New comment on your story!',
  ],
  reaction: [
    'Someone connected with your post!',
    'Your post got a reaction!',
    'Someone felt your vibe!',
    'Your post resonated with someone!',
  ],
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isEnabled, setIsEnabled] = useState(false)

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('anonvibes_notifications_enabled')
    if (stored !== null) {
      setIsEnabled(JSON.parse(stored))
    }
  }, [])

  // Save preference to localStorage
  const toggleNotifications = useCallback((enabled: boolean) => {
    setIsEnabled(enabled)
    localStorage.setItem('anonvibes_notifications_enabled', JSON.stringify(enabled))
  }, [])

  // Add a new notification
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

  // Simulate receiving notifications every hour
  useEffect(() => {
    if (!isEnabled) return

    const notificationTypes: NotificationType[] = ['post', 'comment', 'reaction']
    
    const interval = setInterval(() => {
      const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
      addNotification(randomType)
    }, 60 * 60 * 1000) // Every hour

    return () => clearInterval(interval)
  }, [isEnabled, addNotification])

  return {
    notifications,
    isEnabled,
    toggleNotifications,
    addNotification,
  }
}
