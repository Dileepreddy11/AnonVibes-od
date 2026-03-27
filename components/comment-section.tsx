'use client'

import { useState, useCallback } from 'react'
import { useComments } from '@/hooks/use-comments'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { checkContentRealtime } from '@/lib/moderation'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { Send, MessageCircle, ChevronDown, AlertTriangle, Reply, CornerDownRight } from 'lucide-react'
import type { Timestamp } from 'firebase/firestore'
import type { Comment } from '@/lib/types'

interface CommentSectionProps {
  postId: string
  userId: string | undefined
  username: string
  initialCommentCount: number
  onCommentAdded?: () => void
  defaultExpanded?: boolean
}

export function CommentSection({
  postId,
  userId,
  username,
  initialCommentCount,
  onCommentAdded,
  defaultExpanded = false,
}: CommentSectionProps) {
  const { comments, loading, addComment } = useComments(postId)
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null)
  const [replyContent, setReplyContent] = useState('')

  // Real-time content validation for comments
  const contentCheck = checkContentRealtime(newComment)
  const hasValidationWarning = contentCheck.hasBadWords || contentCheck.hasNames

  const replyContentCheck = checkContentRealtime(replyContent)
  const hasReplyValidationWarning = replyContentCheck.hasBadWords || replyContentCheck.hasNames

  // Prevent paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    setError('Copy-paste is disabled')
    setTimeout(() => setError(null), 2000)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || !userId || hasValidationWarning) return
    
    setError(null)
    setIsSubmitting(true)

    try {
      await addComment(newComment.trim(), userId, username, null)
      setNewComment('')
      onCommentAdded?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!replyContent.trim() || !userId || !replyingTo || hasReplyValidationWarning) return
    
    setError(null)
    setIsSubmitting(true)

    try {
      await addComment(replyContent.trim(), userId, username, replyingTo.id)
      setReplyContent('')
      setReplyingTo(null)
      onCommentAdded?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Organize comments into tree structure
  const organizeComments = (allComments: Comment[]): Comment[] => {
    const rootComments: Comment[] = []
    const replyMap = new Map<string, Comment[]>()

    allComments.forEach(comment => {
      if (!comment.parentId) {
        rootComments.push({ ...comment, replies: [] })
      } else {
        const replies = replyMap.get(comment.parentId) || []
        replies.push(comment)
        replyMap.set(comment.parentId, replies)
      }
    })

    rootComments.forEach(comment => {
      comment.replies = replyMap.get(comment.id) || []
      comment.replies.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime() || 0
        const bTime = b.createdAt?.toDate?.()?.getTime() || 0
        return aTime - bTime
      })
    })

    return rootComments
  }

  const organizedComments = organizeComments(comments)
  const commentCount = comments.length || initialCommentCount

  const renderComment = (comment: Comment, isReply = false, index = 0) => (
    <div
      key={comment.id}
      className={cn(
        'rounded-lg p-3 transition-all duration-300',
        isReply ? 'bg-secondary/30 ml-6 border-l-2 border-primary/20' : 'bg-secondary/50',
        'animate-in fade-in slide-in-from-left-2 hover:bg-secondary/70'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-foreground flex items-center gap-1">
          {isReply && <CornerDownRight className="h-3 w-3 text-muted-foreground" />}
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
      <p className="text-sm text-muted-foreground mb-2">
        {comment.content}
      </p>
      
      {!isReply && userId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setReplyingTo({ id: comment.id, name: comment.authorName })}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Reply className="h-3 w-3 mr-1" />
          Reply
        </Button>
      )}

      {replyingTo?.id === comment.id && (
        <form onSubmit={handleReplySubmit} className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onPaste={handlePaste}
              placeholder={`Reply to ${replyingTo.name}...`}
              maxLength={300}
              className={cn(
                'flex-1 rounded-lg border bg-input px-3 py-2 text-sm text-foreground transition-all duration-200',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                hasReplyValidationWarning && 'border-amber-500 focus:ring-amber-500/50'
              )}
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setReplyingTo(null)
                setReplyContent('')
              }}
              className="px-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!replyContent.trim() || isSubmitting || hasReplyValidationWarning}
              className="transition-all duration-200"
            >
              {isSubmitting ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          
          {hasReplyValidationWarning && (
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 animate-in fade-in">
              <AlertTriangle className="h-3 w-3 animate-pulse" />
              <span>
                {replyContentCheck.hasBadWords && 'Inappropriate language detected. '}
                {replyContentCheck.hasNames && 'Please avoid using real names.'}
              </span>
            </div>
          )}
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {comment.replies.map((reply, replyIndex) => renderComment(reply, true, replyIndex))}
        </div>
      )}
    </div>
  )

  return (
    <div className={cn(!defaultExpanded && 'border-t pt-3')}>
      {!defaultExpanded && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
        >
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </span>
          <span className={cn(
            'transition-transform duration-300',
            isExpanded && 'rotate-180'
          )}>
            <ChevronDown className="h-4 w-4" />
          </span>
        </button>
      )}

      {(isExpanded || defaultExpanded) && (
        <div className={cn('space-y-3 animate-in fade-in slide-in-from-top-2 duration-300', !defaultExpanded && 'mt-3')}>
          {loading ? (
            <div className="flex justify-center py-4">
              <Spinner className="h-5 w-5" />
            </div>
          ) : (
            <>
              {organizedComments.length > 0 ? (
                <div className="max-h-80 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                  {organizedComments.map((comment, index) => renderComment(comment, false, index))}
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground animate-pulse">
                  No comments yet. Be the first to show support!
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Write a supportive comment..."
                    maxLength={300}
                    className={cn(
                      'flex-1 rounded-lg border bg-input px-3 py-2 text-sm text-foreground transition-all duration-200',
                      'placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:shadow-md',
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

                {hasValidationWarning && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 animate-in fade-in duration-200">
                    <AlertTriangle className="h-3 w-3 animate-pulse" />
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
