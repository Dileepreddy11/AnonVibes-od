// Real-time Events Hook - Monitors Firestore for new posts, comments, and reactions
import { useEffect, useRef, useCallback } from 'react'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  onSnapshot,
  where,
  QueryConstraint,
  serverTimestamp,
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
    'Fresh post just posted! 📝',
  ],
  comment: [
    'Someone responded to a post! 💬',
    'Your post got a comment! 👀',
    'New comment on the discussion! 💭',
    'Someone has something to say! 📢',
    'New reply incoming! 🔔',
  ],
  reaction: [
    'Your post resonated with someone! ❤️',
    'Someone loved your post! 💕',
    'Your vibe got a reaction! 😊',
    'Your post touched someone! ✨',
    'Someone reacted to your post! 👍',
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
  const unsubscribeRef = useRef<Array<() => void>>([])
  const lastNotificationTimeRef = useRef<Record<string, number>>({})
  const listenerActiveRef = useRef(false)

  // Debounce notifications (don't show more than one per 2 seconds per type)
  const shouldShowNotification = useCallback((key: string): boolean => {
    const now = Date.now()
    const lastTime = lastNotificationTimeRef.current[key] || 0
    if (now - lastTime > 2000) {
      lastNotificationTimeRef.current[key] = now
      return true
    }
    return false
  }, [])

  useEffect(() => {
    if (!userId || listenerActiveRef.current) return

    const notificationsEnabled = getNotificationPreference()
    if (!notificationsEnabled) {
      return
    }

    try {
      listenerActiveRef.current = true
      console.log('[v0] Starting realtime event listeners for user:', userId)

      // Monitor all posts collection and filter by recent ones client-side
      const postsQuery = query(collection(db, 'posts'))

      const unsubscribePosts = onSnapshot(
        postsQuery,
        (snapshot) => {
          console.log('[v0] Posts snapshot received, changes:', snapshot.docChanges().length)
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const post = change.doc.data()
              const postCreatedAt = post.createdAt?.toDate ? post.createdAt.toDate() : new Date(post.createdAt)
              const now = new Date()
              const secondsOld = (now.getTime() - postCreatedAt.getTime()) / 1000

              // Only notify for posts created within last 10 seconds
              if (secondsOld < 10 && post.userId !== userId && shouldShowNotification('post')) {
                console.log('[v0] New post detected, showing notification')
                showNotification({
                  title: '💭 New Post',
                  body: getRandomMessage('post'),
                  tag: `post-${change.doc.id}`,
                })
              }
            }
          })
        },
        (error) => {
          console.error('[v0] Posts listener error:', error)
        }
      )

      // Monitor all comments collection
      const commentsQuery = query(collection(db, 'comments'))

      const unsubscribeComments = onSnapshot(
        commentsQuery,
        (snapshot) => {
          console.log('[v0] Comments snapshot received, changes:', snapshot.docChanges().length)
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const comment = change.doc.data()
              const commentCreatedAt = comment.createdAt?.toDate ? comment.createdAt.toDate() : new Date(comment.createdAt)
              const now = new Date()
              const secondsOld = (now.getTime() - commentCreatedAt.getTime()) / 1000

              // Only notify for comments created within last 10 seconds
              if (secondsOld < 10 && comment.userId !== userId && shouldShowNotification(`comment-${comment.postId}`)) {
                console.log('[v0] New comment detected, showing notification')
                showNotification({
                  title: '💬 New Comment',
                  body: getRandomMessage('comment'),
                  tag: `comment-${change.doc.id}`,
                })
              }
            }
          })
        },
        (error) => {
          console.error('[v0] Comments listener error:', error)
        }
      )

      // Monitor all reactions/likes collection
      const reactionsQuery = query(collection(db, 'reactions'))

      const unsubscribeReactions = onSnapshot(
        reactionsQuery,
        (snapshot) => {
          console.log('[v0] Reactions snapshot received, changes:', snapshot.docChanges().length)
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const reaction = change.doc.data()
              const reactionCreatedAt = reaction.createdAt?.toDate ? reaction.createdAt.toDate() : new Date(reaction.createdAt)
              const now = new Date()
              const secondsOld = (now.getTime() - reactionCreatedAt.getTime()) / 1000

              // Only notify for reactions created within last 10 seconds
              if (secondsOld < 10 && reaction.userId !== userId && shouldShowNotification(`reaction-${reaction.postId}`)) {
                console.log('[v0] New reaction detected, showing notification')
                showNotification({
                  title: '❤️ Someone Reacted',
                  body: getRandomMessage('reaction'),
                  tag: `reaction-${change.doc.id}`,
                })
              }
            }
          })
        },
        (error) => {
          console.error('[v0] Reactions listener error:', error)
        }
      )

      // Store unsubscribe functions
      unsubscribeRef.current = [unsubscribePosts, unsubscribeComments, unsubscribeReactions]

      // Cleanup function
      return () => {
        console.log('[v0] Cleaning up realtime event listeners')
        unsubscribeRef.current.forEach(unsubscribe => unsubscribe())
        unsubscribeRef.current = []
        listenerActiveRef.current = false
      }
    } catch (error) {
      console.error('[v0] Error setting up real-time listeners:', error)
      listenerActiveRef.current = false
    }
  }, [userId, shouldShowNotification])
}
