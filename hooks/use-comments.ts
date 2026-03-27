'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  limit,
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

  // Real-time listener for comments - no index required
  useEffect(() => {
    const commentsRef = collection(db, 'comments')
    // Simple query without where/orderBy to avoid index requirements
    const q = query(commentsRef, limit(500))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Client-side filtering and sorting
        let allComments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[]
        
        // Filter by postId client-side
        allComments = allComments.filter(c => c.postId === postId)
        
        // Sort by createdAt ascending client-side
        allComments.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0
          return aTime - bTime
        })
        
        setComments(allComments)
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

  // Add a comment (with optional parentId for nested comments)
  const addComment = useCallback(
    async (content: string, authorId: string, authorName: string, parentId: string | null = null) => {
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
        parentId: parentId || null,
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
