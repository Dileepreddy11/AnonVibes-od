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
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set())
  const [reactionDocs, setReactionDocs] = useState<ReactionDoc[]>([])
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
        // Simple query without where to avoid index requirements
        const q = query(reactionsRef, limit(1000))
        const snapshot = await getDocs(q)
        
        const reactions = new Set<ReactionType>()
        const docs: ReactionDoc[] = []
        
        // Client-side filtering
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data()
          if (data.postId === postId && data.userId === userId) {
            reactions.add(data.type as ReactionType)
            docs.push({
              id: docSnap.id,
              postId: data.postId,
              userId: data.userId,
              type: data.type as ReactionType,
            })
          }
        })
        
        setUserReactions(reactions)
        setReactionDocs(docs)
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
          // Find the reaction doc to delete
          const reactionDoc = reactionDocs.find(
            r => r.postId === postId && r.userId === userId && r.type === type
          )
          
          if (reactionDoc) {
            await deleteDoc(doc(db, 'reactions', reactionDoc.id))
            
            // Update local state
            setReactionDocs(prev => prev.filter(r => r.id !== reactionDoc.id))
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
          const docRef = await addDoc(collection(db, 'reactions'), {
            postId,
            userId,
            type,
            createdAt: serverTimestamp(),
          })

          // Update local state
          setReactionDocs(prev => [...prev, { id: docRef.id, postId, userId, type }])

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
    [postId, userId, userReactions, reactionDocs]
  )

  return {
    userReactions,
    loading,
    toggleReaction,
    hasReacted: (type: ReactionType) => userReactions.has(type),
  }
}
