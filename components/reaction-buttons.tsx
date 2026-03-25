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
  const { hasReacted, toggleReaction, loading } = useReactions(postId, userId)

  return (
    <div className="flex items-center gap-2">
      {REACTIONS.map((reaction) => {
        const isActive = hasReacted(reaction.type)
        const count = reactionCounts[reaction.type] || 0

        return (
          <button
            key={reaction.type}
            onClick={() => toggleReaction(reaction.type)}
            disabled={loading || !userId}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all',
              'disabled:cursor-not-allowed disabled:opacity-50',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
            title={reaction.label}
          >
            <span className={cn('transition-transform', isActive && 'scale-110')}>
              {reaction.emoji}
            </span>
            <span className="font-medium">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
