'use client'

import { useState, useEffect } from 'react'
import {
  collection,
  query,
  limit,
  onSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Mood, MoodStats } from '@/lib/types'
import { MOODS } from '@/lib/types'

export function useMoodStats() {
  const [stats, setStats] = useState<MoodStats[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPosts, setTotalPosts] = useState(0)
  const [trendingMood, setTrendingMood] = useState<Mood | null>(null)

  useEffect(() => {
    // Get posts - simple query without index requirements
    const postsRef = collection(db, 'posts')
    const q = query(
      postsRef,
      limit(200) // Get posts for stats, filter client-side
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
        
        const moodCounts: Record<Mood, number> = {
          happy: 0,
          sad: 0,
          angry: 0,
          stressed: 0,
          confused: 0,
        }

        // Client-side filtering for time and reported status
        const recentPosts = snapshot.docs.filter((doc) => {
          const data = doc.data()
          if (data.reported) return false
          const createdAt = data.createdAt?.toDate?.()
          if (!createdAt) return true // Include if no timestamp yet
          return createdAt.getTime() > twentyFourHoursAgo
        })

        recentPosts.forEach((doc) => {
          const mood = doc.data().mood as Mood
          if (moodCounts[mood] !== undefined) {
            moodCounts[mood]++
          }
        })

        const total = recentPosts.length
        setTotalPosts(total)

        const moodStats: MoodStats[] = MOODS.map((mood) => ({
          mood: mood.value,
          count: moodCounts[mood.value],
          percentage: total > 0 ? Math.round((moodCounts[mood.value] / total) * 100) : 0,
        }))

        setStats(moodStats)

        // Find trending mood (most posts in last 24h)
        const trending = moodStats.reduce(
          (max, current) => (current.count > max.count ? current : max),
          moodStats[0]
        )
        setTrendingMood(trending && trending.count > 0 ? trending.mood : null)

        setLoading(false)
      },
      (err) => {
        console.error('Error fetching mood stats:', err)
        // Set empty stats on error but don't block UI
        setStats(MOODS.map((mood) => ({
          mood: mood.value,
          count: 0,
          percentage: 0,
        })))
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return {
    stats,
    loading,
    totalPosts,
    trendingMood,
  }
}
