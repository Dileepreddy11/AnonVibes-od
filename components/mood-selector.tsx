'use client'

import { cn } from '@/lib/utils'
import type { Mood } from '@/lib/types'
import { MOODS } from '@/lib/types'

interface MoodSelectorProps {
  selected: Mood | null
  onSelect: (mood: Mood) => void
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
}

export function MoodSelector({
  selected,
  onSelect,
  size = 'md',
  showLabels = true,
}: MoodSelectorProps) {
  const sizeClasses = {
    sm: 'h-10 w-10 text-lg',
    md: 'h-12 w-12 text-xl',
    lg: 'h-14 w-14 text-2xl',
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {MOODS.map((mood, index) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onSelect(mood.value)}
          className={cn(
            'flex flex-col items-center gap-1 rounded-xl p-2 transition-all duration-300',
            'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'active:scale-95',
            'animate-in fade-in slide-in-from-bottom-2',
            selected === mood.value
              ? `${mood.bgColor} ring-2 ring-offset-2 shadow-lg`
              : 'bg-secondary hover:bg-accent hover:shadow-md'
          )}
          style={{
            '--tw-ring-color': `var(--mood-${mood.value})`,
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'both',
          } as React.CSSProperties}
        >
          <span
            className={cn(
              'flex items-center justify-center rounded-lg transition-all duration-300',
              sizeClasses[size],
              selected === mood.value && 'scale-125 animate-bounce'
            )}
          >
            {mood.emoji}
          </span>
          {showLabels && (
            <span
              className={cn(
                'text-xs font-medium transition-all duration-200',
                selected === mood.value 
                  ? `${mood.color} font-semibold` 
                  : 'text-muted-foreground'
              )}
            >
              {mood.label}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
