'use client'

import { useState } from 'react'
import { MoodBadge } from './mood-badge'
import { ReactionButtons } from './reaction-buttons'
import { CommentSection } from './comment-section'
import type { Post } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { Flag, MoreHorizontal, Users } from 'lucide-react'
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
  onReport?: (postId: string) => void
  onCommentAdded?: (postId: string) => void
  index?: number
}

export function PostCard({
  post,
  userId,
  username,
  onReport,
  onCommentAdded,
  index = 0,
}: PostCardProps) {
  const [showReportConfirm, setShowReportConfirm] = useState(false)

  const totalReactions =
    post.reactionCounts.support +
    post.reactionCounts.relate +
    post.reactionCounts.staystrong

  const handleReport = () => {
    onReport?.(post.id)
    setShowReportConfirm(false)
  }

  const isOwnPost = userId === post.authorId

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-50 hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="animate-in fade-in zoom-in-95 duration-200">
            <DropdownMenuItem
              onClick={() => setShowReportConfirm(true)}
              className="text-destructive focus:text-destructive"
            >
              <Flag className="mr-2 h-4 w-4" />
              Report post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="mb-4">
        <p className="whitespace-pre-wrap text-foreground leading-relaxed">{post.content}</p>
      </div>

      {totalReactions > 0 && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground animate-in fade-in duration-500">
          <Users className="h-3 w-3" />
          <span>
            {totalReactions} {totalReactions === 1 ? 'person' : 'people'} showing
            support
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

      {/* Report Confirmation Modal */}
      {showReportConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="mx-4 w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg animate-in zoom-in-95 duration-300">
            <h3 className="mb-2 text-lg font-semibold text-card-foreground">
              Report this post?
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              This will flag the post for review. False reports may result in
              restrictions.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 transition-all duration-200 hover:scale-[1.02]"
                onClick={() => setShowReportConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 transition-all duration-200 hover:scale-[1.02]"
                onClick={handleReport}
              >
                Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
