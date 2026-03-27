'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  limit,
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

interface ReactionDoc {
  id: string
  postId: string
  userId: string
  type: ReactionType
}

export function useReactions(postId: string, userId: string | undefined) {
  // User can only have ONE reaction type per post
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null)
  const [userReactionDocId, setUserReactionDocId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)

  // Fetch user's existing reaction for this post
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchReaction = async () => {
      try {
        const reactionsRef = collection(db, 'reactions')
        const q = query(reactionsRef, limit(1000))
        const snapshot = await getDocs(q)
        
        // Find user's reaction for this specific post
        let foundReaction: ReactionDoc | null = null
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data()
          if (data.postId === postId && data.userId === userId) {
            foundReaction = {
              id: docSnap.id,
              postId: data.postId,
              userId: data.userId,
              type: data.type as ReactionType,
            }
          }
        })
        
        if (foundReaction) {
          setUserReaction(foundReaction.type)
          setUserReactionDocId(foundReaction.id)
        } else {
          setUserReaction(null)
          setUserReactionDocId(null)
        }
      } catch (err) {
        console.error('Error fetching reactions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReaction()
  }, [postId, userId])

  // Toggle reaction - user can only have ONE reaction type at a time
  const toggleReaction = useCallback(
    async (type: ReactionType) => {
      if (!userId || isToggling) return

      setIsToggling(true)

      try {
        const postRef = doc(db, 'posts', postId)

        if (userReaction === type) {
          // Same reaction clicked - remove it (toggle off)
          if (userReactionDocId) {
            await deleteDoc(doc(db, 'reactions', userReactionDocId))
            await updateDoc(postRef, {
              [`reactionCounts.${type}`]: increment(-1),
            })
          }
          setUserReaction(null)
          setUserReactionDocId(null)
        } else if (userReaction) {
          // Different reaction - switch to new type
          if (userReactionDocId) {
            // Delete old reaction
            await deleteDoc(doc(db, 'reactions', userReactionDocId))
            await updateDoc(postRef, {
              [`reactionCounts.${userReaction}`]: increment(-1),
            })
          }
          // Add new reaction
          const docRef = await addDoc(collection(db, 'reactions'), {
            postId,
            userId,
            type,
            createdAt: serverTimestamp(),
          })
          await updateDoc(postRef, {
            [`reactionCounts.${type}`]: increment(1),
          })
          setUserReaction(type)
          setUserReactionDocId(docRef.id)
        } else {
          // No existing reaction - add new one
          const docRef = await addDoc(collection(db, 'reactions'), {
            postId,
            userId,
            type,
            createdAt: serverTimestamp(),
          })
          await updateDoc(postRef, {
            [`reactionCounts.${type}`]: increment(1),
          })
          setUserReaction(type)
          setUserReactionDocId(docRef.id)
        }
      } catch (err) {
        console.error('Error toggling reaction:', err)
      } finally {
        setIsToggling(false)
      }
    },
    [postId, userId, userReaction, userReactionDocId, isToggling]
  )

  return {
    userReaction,
    loading,
    isToggling,
    toggleReaction,
    hasReacted: (type: ReactionType) => userReaction === type,
  }
}
