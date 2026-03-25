'use client'

import { useMoodStats } from '@/hooks/use-mood-stats'
import { MOODS } from '@/lib/types'
import { cn } from '@/lib/utils'
import { TrendingUp, Users } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

export function MoodStats() {
  const { stats, loading, totalPosts, trendingMood } = useMoodStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  const trendingMoodConfig = trendingMood
    ? MOODS.find((m) => m.value === trendingMood)
    : null

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-card-foreground">Community Mood</h3>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          {totalPosts} posts today
        </span>
      </div>

      {trendingMoodConfig && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-secondary p-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">Trending:</span>
          <span className={cn('font-medium', trendingMoodConfig.color)}>
            {trendingMoodConfig.emoji} {trendingMoodConfig.label}
          </span>
        </div>
      )}

      <div className="space-y-3">
        {stats.map((stat) => {
          const moodConfig = MOODS.find((m) => m.value === stat.mood)
          if (!moodConfig) return null

          return (
            <div key={stat.mood} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <span>{moodConfig.emoji}</span>
                  <span className="text-muted-foreground">{moodConfig.label}</span>
                </span>
                <span className="font-medium text-foreground">{stat.percentage}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', moodConfig.bgColor)}
                  style={{
                    width: `${stat.percentage}%`,
                    backgroundColor: `var(--mood-${stat.mood})`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Based on posts from the last 24 hours
      </p>
    </div>
  )
}
