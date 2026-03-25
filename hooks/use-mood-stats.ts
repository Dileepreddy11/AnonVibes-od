'use client'

import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
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
    // Get posts from the last 24 hours
    const twentyFourHoursAgo = Timestamp.fromDate(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    )

    const postsRef = collection(db, 'posts')
    const q = query(
      postsRef,
      where('reported', '==', false),
      where('createdAt', '>=', twentyFourHoursAgo)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const moodCounts: Record<Mood, number> = {
          happy: 0,
          sad: 0,
          angry: 0,
          stressed: 0,
          confused: 0,
        }

        snapshot.docs.forEach((doc) => {
          const mood = doc.data().mood as Mood
          moodCounts[mood]++
        })

        const total = snapshot.docs.length
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
