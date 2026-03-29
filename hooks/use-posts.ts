'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection,
  query,
  limit,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  where,
  serverTimestamp,
  increment,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Post, Mood } from '@/lib/types'
import { validateContent, checkRateLimit, recordPost, REPORT_THRESHOLD, type ReportReason } from '@/lib/moderation'

const POSTS_PER_PAGE = 100

// Helper to get the start of the current week (Sunday 00:00:00)
function getWeekStartSunday(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - dayOfWeek) // Go back to Sunday
  startOfWeek.setHours(0, 0, 0, 0) // Set to midnight
  return startOfWeek
}

// Get stored week start from localStorage
function getStoredWeekStart(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('anonvibes_week_start')
}

// Store current week start
function setStoredWeekStart(weekStart: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('anonvibes_week_start', weekStart)
}

export function usePosts(moodFilter?: Mood | null) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore] = useState(false)
  const cleanupRanRef = useRef(false)

  // Delete ALL posts every Sunday (when a new week starts)
  const cleanupPostsOnSunday = useCallback(async () => {
    if (cleanupRanRef.current) return // Only run once per session
    cleanupRanRef.current = true
    
    try {
      const currentWeekStart = getWeekStartSunday().toISOString()
      const storedWeekStart = getStoredWeekStart()
      
      // Check if we're in a new week (Sunday reset)
      if (storedWeekStart !== currentWeekStart) {
        // New week started - delete ALL posts
        const postsRef = collection(db, 'posts')
        const snapshot = await getDocs(postsRef)
        
        if (snapshot.docs.length > 0) {
          const deletePromises = snapshot.docs.map((docSnap) => 
            deleteDoc(doc(db, 'posts', docSnap.id))
          )
          
          await Promise.all(deletePromises)
          console.log(`[AnonVibes] Weekly reset: Burned ${snapshot.docs.length} posts`)
        }
        
        // Update stored week start
        setStoredWeekStart(currentWeekStart)
      }
    } catch (err) {
      console.error('[AnonVibes] Error during weekly cleanup:', err)
    }
  }, [])

  // Run cleanup on mount
  useEffect(() => {
    cleanupPostsOnSunday()
  }, [cleanupPostsOnSunday])

  useEffect(() => {
    setLoading(true)
    setPosts([])
    setHasMore(false)
    setError(null)

    const postsRef = collection(db, 'posts')
    const q = query(postsRef, limit(POSTS_PER_PAGE))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let newPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          reportCount: 0,
          reportedBy: [],
          ...doc.data(),
        })) as Post[]
        
        // Filter out posts that are hidden (reported flag = true means hidden)
        newPosts = newPosts.filter(post => !post.reported)
        
        if (moodFilter) {
          newPosts = newPosts.filter(post => post.mood === moodFilter)
        }
        
        newPosts.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0
          return bTime - aTime
        })
        
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

  const loadMore = useCallback(async () => {
    setHasMore(false)
  }, [])

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
        reportCount: 0,
        reportedBy: [],
      }

      const docRef = await addDoc(collection(db, 'posts'), postData)
      recordPost()
      return docRef.id
    },
    []
  )

  // Report a post with reason - tracks who reported and hides after threshold
  const reportPost = useCallback(async (postId: string, userId: string, reason: ReportReason) => {
    const postRef = doc(db, 'posts', postId)
    const postSnap = await getDoc(postRef)
    
    if (!postSnap.exists()) {
      throw new Error('Post not found')
    }
    
    const postData = postSnap.data()
    const reportedBy = postData.reportedBy || []
    
    // Check if user already reported this post
    if (reportedBy.includes(userId)) {
      throw new Error('You have already reported this post')
    }
    
    const newReportCount = (postData.reportCount || 0) + 1
    
    // Update report count and add user to reportedBy array
    await updateDoc(postRef, {
      reportCount: increment(1),
      reportedBy: arrayUnion(userId),
      lastReportReason: reason,
      // Hide post if threshold reached
      reported: newReportCount >= REPORT_THRESHOLD,
    })
    
    return {
      newReportCount,
      isHidden: newReportCount >= REPORT_THRESHOLD,
    }
  }, [])

  // Delete a post (only for post owner)
  const deletePost = useCallback(async (postId: string, userId: string) => {
    const postRef = doc(db, 'posts', postId)
    const postSnap = await getDoc(postRef)
    
    if (!postSnap.exists()) {
      throw new Error('Post not found')
    }
    
    const postData = postSnap.data()
    if (postData.authorId !== userId) {
      throw new Error('You can only delete your own posts')
    }
    
    await deleteDoc(postRef)
  }, [])

  const incrementCommentCount = useCallback(async (postId: string) => {
    const postRef = doc(db, 'posts', postId)
    await updateDoc(postRef, { commentCount: increment(1) })
  }, [])

  // Check if user has reported a post
  const hasUserReported = useCallback((post: Post, userId: string): boolean => {
    return post.reportedBy?.includes(userId) || false
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
    deletePost,
    incrementCommentCount,
    hasUserReported,
  }
}
