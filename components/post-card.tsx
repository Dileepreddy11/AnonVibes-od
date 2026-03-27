'use client'

import { useState } from 'react'
import { MoodBadge } from './mood-badge'
import { ReactionButtons } from './reaction-buttons'
import { CommentSection } from './comment-section'
import type { Post } from '@/lib/types'
import { REPORT_REASONS, REPORT_THRESHOLD, type ReportReason } from '@/lib/moderation'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { Flag, MoreHorizontal, Users, AlertTriangle, Check, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { Timestamp } from 'firebase/firestore'

interface PostCardProps {
  post: Post
  userId: string | undefined
  username: string
  onReport?: (postId: string, reason: ReportReason) => Promise<{ newReportCount: number; isHidden: boolean }>
  onCommentAdded?: (postId: string) => void
  index?: number
  hasUserReported?: boolean
  onOpenReport?: (postId: string) => void
}

export function PostCard({
  post,
  userId,
  username,
  onReport,
  onCommentAdded,
  index = 0,
  hasUserReported = false,
  onOpenReport,
}: PostCardProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null)
  const [isReporting, setIsReporting] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)
  const [reportSuccess, setReportSuccess] = useState(false)
  const [localReportCount, setLocalReportCount] = useState(post.reportCount || 0)
  const [localHasReported, setLocalHasReported] = useState(hasUserReported)

  const totalReactions =
    post.reactionCounts.support +
    post.reactionCounts.relate +
    post.reactionCounts.staystrong

  const isOwnPost = userId === post.authorId

  const handleReport = async () => {
    if (!selectedReason || !userId) return
    
    setIsReporting(true)
    setReportError(null)
    
    try {
      const result = await onReport?.(post.id, selectedReason)
      if (result) {
        setLocalReportCount(result.newReportCount)
        setLocalHasReported(true)
        setReportSuccess(true)
        setTimeout(() => {
          setShowReportModal(false)
          setReportSuccess(false)
          setSelectedReason(null)
        }, 1500)
      }
    } catch (error) {
      setReportError(error instanceof Error ? error.message : 'Failed to report')
    } finally {
      setIsReporting(false)
    }
  }

  return (
    <article 
      className={cn(
        'rounded-xl border bg-card p-4 shadow-sm transition-all duration-300',
        'hover:shadow-md hover:border-primary/20',
        'animate-in fade-in slide-in-from-bottom-4'
      )}
      style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'both' }}
    >
      <header className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <MoodBadge mood={post.mood} size="sm" />
          <div>
            <p className="text-sm font-medium text-card-foreground flex items-center gap-2">
              {post.authorName}
              {isOwnPost && (
                <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  You
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {post.createdAt &&
                formatDistanceToNow((post.createdAt as Timestamp).toDate(), {
                  addSuffix: true,
                })}
            </p>
          </div>
        </div>

        {/* Only show menu for other users' posts */}
        {!isOwnPost && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-50 hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-in fade-in zoom-in-95 duration-200">
              <DropdownMenuItem
                onClick={() => onOpenReport?.(post.id)}
                disabled={localHasReported}
                className={cn(
                  "text-destructive focus:text-destructive",
                  localHasReported && "opacity-50 cursor-not-allowed"
                )}
              >
                <Flag className="mr-2 h-4 w-4" />
                {localHasReported ? 'Already reported' : 'Report post'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      <div className="mb-4">
        <p className="whitespace-pre-wrap text-foreground leading-relaxed">{post.content}</p>
      </div>

      {/* Report count indicator - shows if post has reports */}
      {localReportCount > 0 && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md animate-in fade-in duration-300">
          <AlertTriangle className="h-3 w-3" />
          <span>
            {localReportCount} {localReportCount === 1 ? 'person' : 'people'} flagged this post
            {localReportCount >= REPORT_THRESHOLD - 1 && localReportCount < REPORT_THRESHOLD && (
              <span className="ml-1 text-amber-700 dark:text-amber-300">
                - May be removed soon
              </span>
            )}
          </span>
        </div>
      )}

      {totalReactions > 0 && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground animate-in fade-in duration-500">
          <Users className="h-3 w-3" />
          <span>
            {totalReactions} {totalReactions === 1 ? 'person' : 'people'} showing support
          </span>
          <span className="text-primary font-medium">- You&apos;re not alone</span>
        </div>
      )}

      <div className="mb-3">
        <ReactionButtons
          postId={post.id}
          userId={userId}
          reactionCounts={post.reactionCounts}
        />
      </div>

      <CommentSection
        postId={post.id}
        userId={userId}
        username={username}
        initialCommentCount={post.commentCount}
        onCommentAdded={() => onCommentAdded?.(post.id)}
      />
    </div>
  )
}
