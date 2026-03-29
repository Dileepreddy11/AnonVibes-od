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

// Helper to get the start of the current week (Friday 00:00:00)
function getWeekStartFriday(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, ..., 5 = Friday
  // Calculate days since last Friday
  const daysSinceFriday = dayOfWeek >= 5 ? dayOfWeek - 5 : dayOfWeek + 2
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - daysSinceFriday)
  startOfWeek.setHours(0, 0, 0, 0) // Set to midnight
  return startOfWeek
}

export function usePosts(moodFilter?: Mood | null) {
  const [posts, setPosts] = useState<Post[]>([])
  const [archivedPosts, setArchivedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore] = useState(false)

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
        const weekStart = getWeekStartFriday()
        
        let allPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          reportCount: 0,
          reportedBy: [],
          ...doc.data(),
        })) as Post[]
        
        // Filter out posts that are hidden (reported flag = true means hidden)
        allPosts = allPosts.filter(post => !post.reported)
        
        // Sort all posts by date
        allPosts.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0
          return bTime - aTime
        })
        
        // Separate current week posts and archived posts
        const currentWeekPosts: Post[] = []
        const archived: Post[] = []
        
        allPosts.forEach(post => {
          const postDate = post.createdAt?.toDate?.()
          if (postDate && postDate >= weekStart) {
            currentWeekPosts.push(post)
          } else {
            archived.push(post)
          }
        })
        
        // Apply mood filter to current week posts only
        let filteredPosts = currentWeekPosts
        if (moodFilter) {
          filteredPosts = currentWeekPosts.filter(post => post.mood === moodFilter)
        }
        
        setPosts(filteredPosts)
        setArchivedPosts(archived)
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
    archivedPosts,
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
