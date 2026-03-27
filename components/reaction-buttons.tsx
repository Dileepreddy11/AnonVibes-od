'use client'

import { useReactions } from '@/hooks/use-reactions'
import { REACTIONS } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ReactionButtonsProps {
  postId: string
  userId: string | undefined
  reactionCounts: {
    support: number
    relate: number
    staystrong: number
  }
}

export function ReactionButtons({
  postId,
  userId,
  reactionCounts,
}: ReactionButtonsProps) {
  const { userReaction, toggleReaction, loading, isToggling } = useReactions(postId, userId)

  return (
    <div className="flex items-center gap-2">
      {REACTIONS.map((reaction) => {
        const isActive = userReaction === reaction.type
        const count = reactionCounts[reaction.type] || 0

        return (
          <button
            key={reaction.type}
            onClick={() => toggleReaction(reaction.type)}
            disabled={loading || isToggling || !userId}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all duration-300',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'hover:scale-105 active:scale-95',
              isActive
                ? 'bg-primary/15 text-primary ring-1 ring-primary/30 shadow-sm'
                : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
            title={`${reaction.label}${userReaction && userReaction !== reaction.type ? ' (will replace current reaction)' : ''}`}
          >
            <span className={cn(
              'transition-transform duration-300',
              isActive && 'scale-125 animate-in zoom-in duration-300'
            )}>
              {reaction.emoji}
            </span>
            <span className={cn(
              'font-medium transition-all duration-200',
              isActive && 'font-semibold'
            )}>
              {count}
            </span>
          </button>
        )
      })}
      
      {/* Indicator showing user can only react once */}
      {userReaction && (
        <span className="text-xs text-muted-foreground ml-1 animate-in fade-in duration-300">
          (1 reaction)
        </span>
      )}
    </div>
  )
}
