'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
  type DocumentData,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Post, Mood } from '@/lib/types'
import { validateContent, checkRateLimit, recordPost } from '@/lib/moderation'

const POSTS_PER_PAGE = 10

export function usePosts(moodFilter?: Mood | null) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Real-time listener for posts
  useEffect(() => {
    setLoading(true)
    setPosts([])
    setLastDoc(null)
    setHasMore(true)

    const postsRef = collection(db, 'posts')
    let q = query(
      postsRef,
      where('reported', '==', false),
      orderBy('createdAt', 'desc'),
      limit(POSTS_PER_PAGE)
    )

    if (moodFilter) {
      q = query(
        postsRef,
        where('reported', '==', false),
        where('mood', '==', moodFilter),
        orderBy('createdAt', 'desc'),
        limit(POSTS_PER_PAGE)
      )
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[]
        
        setPosts(newPosts)
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null)
        setHasMore(snapshot.docs.length === POSTS_PER_PAGE)
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

  // Load more posts (pagination)
  const loadMore = useCallback(async () => {
    if (!lastDoc || loadingMore || !hasMore) return

    setLoadingMore(true)
    
    const postsRef = collection(db, 'posts')
    let q = query(
      postsRef,
      where('reported', '==', false),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(POSTS_PER_PAGE)
    )

    if (moodFilter) {
      q = query(
        postsRef,
        where('reported', '==', false),
        where('mood', '==', moodFilter),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(POSTS_PER_PAGE)
      )
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const morePosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[]
        
        setPosts((prev) => [...prev, ...morePosts])
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null)
        setHasMore(snapshot.docs.length === POSTS_PER_PAGE)
        setLoadingMore(false)
      },
      { once: true }
    )

    return () => unsubscribe()
  }, [lastDoc, loadingMore, hasMore, moodFilter])

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
