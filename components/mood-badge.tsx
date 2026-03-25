'use client'

import { cn } from '@/lib/utils'
import type { Mood } from '@/lib/types'
import { MOODS } from '@/lib/types'

interface MoodBadgeProps {
  mood: Mood
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function MoodBadge({ mood, size = 'md', showLabel = true }: MoodBadgeProps) {
  const moodConfig = MOODS.find((m) => m.value === mood)
  if (!moodConfig) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        moodConfig.bgColor,
        moodConfig.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      <span>{moodConfig.emoji}</span>
      {showLabel && <span>{moodConfig.label}</span>}
    </span>
  )
}
