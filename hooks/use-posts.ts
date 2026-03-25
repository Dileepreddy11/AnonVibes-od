'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  limit,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Post, Mood } from '@/lib/types'
import { validateContent, checkRateLimit, recordPost } from '@/lib/moderation'

const POSTS_PER_PAGE = 20

export function usePosts(moodFilter?: Mood | null) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore] = useState(false)

  // Real-time listener for posts - simplified query without composite index requirement
  useEffect(() => {
    setLoading(true)
    setPosts([])
    setHasMore(false)
    setError(null)

    const postsRef = collection(db, 'posts')
    // Simple query - no orderBy to avoid index requirements, sort client-side
    const q = query(
      postsRef,
      limit(100) // Fetch enough to filter and sort client-side
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let newPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[]
        
        // Client-side filtering for reported posts and mood
        newPosts = newPosts.filter(post => !post.reported)
        
        if (moodFilter) {
          newPosts = newPosts.filter(post => post.mood === moodFilter)
        }
        
        // Sort client-side by createdAt descending
        newPosts.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0
          return bTime - aTime
        })
        
        // Show all posts (limited by initial fetch)
        setPosts(newPosts)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching posts:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [moodFilter])

  // Load more is handled by fetching more initially - simplified for no-index approach
  const loadMore = useCallback(async () => {
    // For now, we fetch all at once to avoid index requirements
    // In production, you'd create proper indexes for pagination
    setHasMore(false)
  }, [])

  // Create a new post
  const createPost = useCallback(
    async (content: string, mood: Mood, authorId: string, authorName: string) => {
      const validation = validateContent(content)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const rateLimit = checkRateLimit()
      if (!rateLimit.allowed) {
        const waitSeconds = Math.ceil((rateLimit.waitTime || 0) / 1000)
        throw new Error(`Please wait ${waitSeconds} seconds before posting again`)
      }

      const postData = {
        content: content.trim(),
        mood,
        authorId,
        authorName,
        createdAt: serverTimestamp(),
        reactionCounts: {
          support: 0,
          relate: 0,
          staystrong: 0,
        },
        commentCount: 0,
        reported: false,
      }

      const docRef = await addDoc(collection(db, 'posts'), postData)
      recordPost()
      return docRef.id
    },
    []
  )

  // Report a post
  const reportPost = useCallback(async (postId: string) => {
    const postRef = doc(db, 'posts', postId)
    await updateDoc(postRef, { reported: true })
  }, [])

  // Increment comment count
  const incrementCommentCount = useCallback(async (postId: string) => {
    const postRef = doc(db, 'posts', postId)
    await updateDoc(postRef, { commentCount: increment(1) })
  }, [])

  return {
    posts,
    loading,
    error,
    hasMore,
    loadingMore,
    loadMore,
    createPost,
    reportPost,
    incrementCommentCount,
  }
}
