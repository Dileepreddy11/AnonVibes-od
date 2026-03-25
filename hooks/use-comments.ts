'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Comment } from '@/lib/types'
import { validateContent } from '@/lib/moderation'

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real-time listener for comments
  useEffect(() => {
    const commentsRef = collection(db, 'comments')
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newComments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[]
        
        setComments(newComments)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching comments:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [postId])

  // Add a comment
  const addComment = useCallback(
    async (content: string, authorId: string, authorName: string) => {
      const validation = validateContent(content)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const commentData = {
        postId,
        content: content.trim(),
        authorId,
        authorName,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'comments'), commentData)
      return docRef.id
    },
    [postId]
  )

  return {
    comments,
    loading,
    error,
    addComment,
    commentCount: comments.length,
  }
}
