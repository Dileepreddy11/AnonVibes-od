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
  const lastPostTimeRef = useRef<number>(0)

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
    if (!userId) {
      console.log('[v0] useRealtimeEvents: userId not available yet')
      return
    }

    // Check if notifications are enabled - this will be checked dynamically
    const checkAndSetupListeners = () => {
      const notificationsEnabled = getNotificationPreference()
      console.log('[v0] Notifications enabled preference:', notificationsEnabled)
      
      if (!notificationsEnabled) {
        console.log('[v0] Notifications are disabled, skipping real-time setup')
        return
      }

      try {
        // Set the baseline time to only listen for NEW events (after this hook runs)
        const now = Timestamp.now()
        console.log('[v0] Setting up real-time listeners for userId:', userId)

        // Monitor new posts in real-time
        const postsQuery = query(collection(db, 'posts'))

        const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' && shouldShowNotification('post')) {
              const post = change.doc.data()
              console.log('[v0] New post detected:', { postId: change.doc.id, userId: post.userId, currentUserId: userId })
              
              // Show notification for posts from other users
              if (post.userId !== userId) {
                console.log('[v0] Showing new post notification')
                showNotification({
                  title: '💭 New Post',
                  body: getRandomMessage('post'),
                  tag: `post-${change.doc.id}`,
                })
              }
            }
          })
        }, (error) => {
          console.error('[v0] Error in posts listener:', error)
        })

        // Monitor comments in real-time
        const commentsQuery = query(collection(db, 'comments'))

        const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' && shouldShowNotification('comment')) {
              const comment = change.doc.data()
              console.log('[v0] New comment detected:', { commentId: change.doc.id, postId: comment.postId })
              
              // Show notification for comments on user's posts
              if (comment.userId !== userId && shouldShowNotification(`comment-${comment.postId}`)) {
                console.log('[v0] Showing new comment notification')
                showNotification({
                  title: '💬 New Comment',
                  body: getRandomMessage('comment'),
                  tag: `comment-${change.doc.id}`,
                })
              }
            }
          })
        }, (error) => {
          console.error('[v0] Error in comments listener:', error)
        })

        // Monitor reactions/likes in real-time
        const reactionsQuery = query(collection(db, 'reactions'))

        const unsubscribeReactions = onSnapshot(reactionsQuery, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added' && shouldShowNotification('reaction')) {
              const reaction = change.doc.data()
              console.log('[v0] New reaction detected:', { reactionId: change.doc.id, postId: reaction.postId })
              
              // Show notification for reactions on user's posts
              if (reaction.userId !== userId && shouldShowNotification(`reaction-${reaction.postId}`)) {
                console.log('[v0] Showing new reaction notification')
                showNotification({
                  title: '❤️ Someone Reacted',
                  body: getRandomMessage('reaction'),
                  tag: `reaction-${change.doc.id}`,
                })
              }
            }
          })
        }, (error) => {
          console.error('[v0] Error in reactions listener:', error)
        })

        // Cleanup function
        unsubscribeRef.current = () => {
          console.log('[v0] Cleaning up real-time listeners')
          unsubscribePosts()
          unsubscribeComments()
          unsubscribeReactions()
        }
      } catch (error) {
        console.error('[v0] Error setting up real-time listeners:', error)
      }
    }

    // Setup listeners
    checkAndSetupListeners()

    // Also listen for preference changes and re-setup if needed
    const handleStorageChange = () => {
      console.log('[v0] Storage change detected, checking notification preference')
      const notificationsEnabled = getNotificationPreference()
      if (notificationsEnabled && !unsubscribeRef.current) {
        console.log('[v0] Re-setting up listeners after preference change')
        checkAndSetupListeners()
      } else if (!notificationsEnabled && unsubscribeRef.current) {
        console.log('[v0] Cleaning up listeners after preference change')
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [userId, shouldShowNotification])
}
