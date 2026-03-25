'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ReactionType } from '@/lib/types'

export function useReactions(postId: string, userId: string | undefined) {
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set())
  const [loading, setLoading] = useState(true)

  // Fetch user's existing reactions for this post
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchReactions = async () => {
      try {
        const reactionsRef = collection(db, 'reactions')
        const q = query(
          reactionsRef,
          where('postId', '==', postId),
          where('userId', '==', userId)
        )
        const snapshot = await getDocs(q)
        
        const reactions = new Set<ReactionType>()
        snapshot.docs.forEach((doc) => {
          reactions.add(doc.data().type as ReactionType)
        })
        
        setUserReactions(reactions)
      } catch (err) {
        console.error('Error fetching reactions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReactions()
  }, [postId, userId])

  // Toggle reaction
  const toggleReaction = useCallback(
    async (type: ReactionType) => {
      if (!userId) return

      const hasReaction = userReactions.has(type)
      
      try {
        if (hasReaction) {
          // Remove reaction
          const reactionsRef = collection(db, 'reactions')
          const q = query(
            reactionsRef,
            where('postId', '==', postId),
            where('userId', '==', userId),
            where('type', '==', type)
          )
          const snapshot = await getDocs(q)
          
          for (const docSnapshot of snapshot.docs) {
            await deleteDoc(doc(db, 'reactions', docSnapshot.id))
          }

          // Update post reaction count
          const postRef = doc(db, 'posts', postId)
          await updateDoc(postRef, {
            [`reactionCounts.${type}`]: increment(-1),
          })

          setUserReactions((prev) => {
            const next = new Set(prev)
            next.delete(type)
            return next
          })
        } else {
          // Add reaction
          await addDoc(collection(db, 'reactions'), {
            postId,
            userId,
            type,
            createdAt: serverTimestamp(),
          })

          // Update post reaction count
          const postRef = doc(db, 'posts', postId)
          await updateDoc(postRef, {
            [`reactionCounts.${type}`]: increment(1),
          })

          setUserReactions((prev) => new Set(prev).add(type))
        }
      } catch (err) {
        console.error('Error toggling reaction:', err)
      }
    },
    [postId, userId, userReactions]
  )

  return {
    userReactions,
    loading,
    toggleReaction,
    hasReacted: (type: ReactionType) => userReactions.has(type),
  }
}
