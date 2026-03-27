'use client'

import { useState } from 'react'
import { useComments } from '@/hooks/use-comments'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { checkContentRealtime } from '@/lib/moderation'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { Send, MessageCircle, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'

interface CommentSectionProps {
  postId: string
  userId: string | undefined
  username: string
  initialCommentCount: number
  onCommentAdded?: () => void
}

export function CommentSection({
  postId,
  userId,
  username,
  initialCommentCount,
  onCommentAdded,
}: CommentSectionProps) {
  const { comments, loading, addComment } = useComments(postId)
  const [isExpanded, setIsExpanded] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Real-time content validation for comments
  const contentCheck = checkContentRealtime(newComment)
  const hasValidationWarning = contentCheck.hasBadWords || contentCheck.hasNames

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || !userId || hasValidationWarning) return
    
    setError(null)
    setIsSubmitting(true)

    try {
      await addComment(newComment.trim(), userId, username)
      setNewComment('')
      onCommentAdded?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const commentCount = comments.length || initialCommentCount

  return (
    <div className="border-t pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
      >
        <span className="flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4" />
          {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
        </span>
        <span className={cn(
          'transition-transform duration-200',
          isExpanded && 'rotate-180'
        )}>
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {loading ? (
            <div className="flex justify-center py-4">
              <Spinner className="h-5 w-5" />
            </div>
          ) : (
            <>
              {comments.length > 0 ? (
                <div className="max-h-60 space-y-3 overflow-y-auto">
                  {comments.map((comment, index) => (
                    <div
                      key={comment.id}
                      className={cn(
                        'rounded-lg bg-secondary/50 p-3 transition-all duration-300',
                        'animate-in fade-in slide-in-from-left-2'
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {comment.createdAt &&
                            formatDistanceToNow(
                              (comment.createdAt as Timestamp).toDate(),
                              { addSuffix: true }
                            )}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  No comments yet. Be the first to show support!
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a supportive comment..."
                    maxLength={300}
                    className={cn(
                      'flex-1 rounded-lg border bg-input px-3 py-2 text-sm text-foreground transition-all duration-200',
                      'placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-ring',
                      hasValidationWarning && 'border-amber-500 focus:ring-amber-500/50'
                    )}
                    disabled={!userId || isSubmitting}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!newComment.trim() || !userId || isSubmitting || hasValidationWarning}
                    className="transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    {isSubmitting ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Real-time validation warning */}
                {hasValidationWarning && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 animate-in fade-in duration-200">
                    <AlertTriangle className="h-3 w-3" />
                    <span>
                      {contentCheck.hasBadWords && 'Inappropriate language detected. '}
                      {contentCheck.hasNames && 'Please avoid using real names.'}
                    </span>
                  </div>
                )}
              </form>

              {error && (
                <p className="text-xs text-destructive animate-in fade-in duration-200">{error}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
