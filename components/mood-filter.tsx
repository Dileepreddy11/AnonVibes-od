'use client'

import { cn } from '@/lib/utils'
import type { Mood } from '@/lib/types'
import { MOODS } from '@/lib/types'

interface MoodFilterProps {
  selected: Mood | null
  onSelect: (mood: Mood | null) => void
}

export function MoodFilter({ selected, onSelect }: MoodFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'rounded-full px-4 py-2 text-sm font-medium transition-all',
          selected === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-accent'
        )}
      >
        All Moods
      </button>
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onSelect(mood.value)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all',
            selected === mood.value
              ? `${mood.bgColor} ${mood.color}`
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          )}
        >
          <span>{mood.emoji}</span>
          <span className="hidden sm:inline">{mood.label}</span>
        </button>
      ))}
    </div>
  )
}
