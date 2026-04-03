// Real-time Events Hook - Monitors Firestore for new posts, comments, and reactions
import { useEffect, useRef, useCallback } from 'react'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  onSnapshot,
  where,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore'
import { showNotification, getNotificationPreference } from '@/lib/push-notification-manager'

interface RealtimeEvent {
  type: 'post' | 'comment' | 'reaction' | 'reply'
  title: string
  body: string
  postId: string
  userId: string
  timestamp: Timestamp
}

const notificationMessages = {
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
  reply: [
    'Someone replied to your comment! 💬',
    'New reply on your comment! 👋',
    'Someone answered your comment! 📝',
  ],
}

function getRandomMessage(type: 'post' | 'comment' | 'reaction' | 'reply'): string {
  const messages = notificationMessages[type]
  return messages[Math.floor(Math.random() * messages.length)]
}

export function useRealtimeEvents(userId: string | null) {
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const lastNotificationTimeRef = useRef<Record<string, number>>({})

  // Debounce notifications (don't show more than one per 3 seconds per type)
  const shouldShowNotification = useCallback((key: string): boolean => {
    const now = Date.now()
    const lastTime = lastNotificationTimeRef.current[key] || 0
    if (now - lastTime > 3000) {
      lastNotificationTimeRef.current[key] = now
      return true
    }
    return false
  }, [])

  useEffect(() => {
    if (!userId) return

    const notificationsEnabled = getNotificationPreference()
    if (!notificationsEnabled) {
      return
    }

    try {
      // Monitor new posts in real-time
      const postsQuery = query(collection(db, 'posts'), where('createdAt', '>', Timestamp.now()))

      const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && shouldShowNotification('post')) {
            const post = change.doc.data()
            if (post.userId !== userId) {
              showNotification({
                title: '💭 New Post',
                body: getRandomMessage('post'),
                tag: `post-${change.doc.id}`,
              })
            }
          }
        })
      })

      // Monitor comments in real-time
      const commentsQuery = query(collection(db, 'comments'), where('createdAt', '>', Timestamp.now()))

      const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && shouldShowNotification('comment')) {
            const comment = change.doc.data()
            if (comment.userId !== userId && shouldShowNotification(`comment-${comment.postId}`)) {
              showNotification({
                title: '💬 New Comment',
                body: getRandomMessage('comment'),
                tag: `comment-${change.doc.id}`,
              })
            }
          }
        })
      })

      // Monitor reactions/likes in real-time
      const reactionsQuery = query(collection(db, 'reactions'), where('createdAt', '>', Timestamp.now()))

      const unsubscribeReactions = onSnapshot(reactionsQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && shouldShowNotification('reaction')) {
            const reaction = change.doc.data()
            if (reaction.userId !== userId && shouldShowNotification(`reaction-${reaction.postId}`)) {
              showNotification({
                title: '❤️ Someone Reacted',
                body: getRandomMessage('reaction'),
                tag: `reaction-${change.doc.id}`,
              })
            }
          }
        })
      })

      // Cleanup function
      unsubscribeRef.current = () => {
        unsubscribePosts()
        unsubscribeComments()
        unsubscribeReactions()
      }

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
        }
      }
    } catch (error) {
      console.error('Error setting up real-time listeners:', error)
    }
  }, [userId, shouldShowNotification])
}
