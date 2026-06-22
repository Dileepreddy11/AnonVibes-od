'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { PostCard } from './post-card'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import type { Post } from '@/lib/types'
import type { ReportReason } from '@/lib/moderation'
import { REPORT_REASONS, REPORT_THRESHOLD } from '@/lib/moderation'
import { cn } from '@/lib/utils'
import { MessageSquareOff, RefreshCw, Flag, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'

const POSTS_PER_PAGE = 10

interface PostListProps {
  posts: Post[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
  userId: string | undefined
  username: string
  onReport: (postId: string, reason: ReportReason) => Promise<{ newReportCount: number; isHidden: boolean }>
  onCommentAdded: (postId: string) => void
  hasUserReported: (post: Post, userId: string) => boolean
}

export function PostList({
  posts,
  loading,
  error,
  hasMore,
  loadingMore,
  onLoadMore,
  userId,
  username,
  onReport,
  onCommentAdded,
  hasUserReported,
}: PostListProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [reportingPostId, setReportingPostId] = useState<string | null>(null)
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null)
  const [isReporting, setIsReporting] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)
  const [reportSuccess, setReportSuccess] = useState(false)

  // Track local report counts for immediate UI updates
  const [localReportCounts, setLocalReportCounts] = useState<Record<string, number>>({})
  const [localReportedPosts, setLocalReportedPosts] = useState<Set<string>>(new Set())

  // Reset to page 0 when posts array changes (e.g., when filter is applied)
  useEffect(() => {
    setCurrentPage(0)
  }, [posts.length, posts[0]?.id])

  // Calculate pagination
  const startIndex = currentPage * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const displayedPosts = posts.slice(startIndex, endIndex)
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const canGoNext = currentPage < totalPages - 1
  const canGoPrevious = currentPage > 0

  const handleReportSubmit = async () => {
    if (!reportingPostId || !selectedReason) return
    setIsReporting(true)
    setReportError(null)
    try {
      const result = await onReport(reportingPostId, selectedReason)
      // Update local state immediately for instant UI feedback
      setLocalReportCounts(prev => ({ ...prev, [reportingPostId]: result.newReportCount }))
      setLocalReportedPosts(prev => new Set([...prev, reportingPostId]))
      setReportSuccess(true)
      setTimeout(() => {
        setReportingPostId(null)
        setSelectedReason(null)
        setReportSuccess(false)
      }, 2000)
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Failed to submit report')
    } finally {
      setIsReporting(false)
    }
  }
  
  // Get the effective report count (local override or from post)
  const getReportCount = (post: Post) => {
    return localReportCounts[post.id] ?? post.reportCount ?? 0
  }
  
  // Check if user has reported (including local state)
  const checkHasReported = (post: Post) => {
    return localReportedPosts.has(post.id) || (userId ? hasUserReported(post, userId) : false)
  }

  const handleNextPage = () => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePreviousPage = () => {
    if (canGoPrevious) {
      setCurrentPage(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner className="mb-4 h-8 w-8" />
        <p className="text-muted-foreground">Loading posts...</p>
      </div>
    )
  }

  if (error) {
    const isIndexError = error.includes('index')
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="mb-2 text-destructive font-medium">
          {isIndexError ? 'Database setup needed' : 'Something went wrong'}
        </p>
        <p className="mb-4 text-sm text-muted-foreground text-center max-w-md">
          {isIndexError 
            ? 'Firestore needs an index for this query. Click the link in the console error to create it automatically.'
            : error}
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquareOff className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-medium text-foreground">No posts yet</h3>
        <p className="text-muted-foreground">
          Be the first to share how you&apos;re feeling!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayedPosts.map((post, index) => (
        <PostCard
          key={post.id}
          post={{ ...post, reportCount: getReportCount(post) }}
          userId={userId}
          username={username}
          onReport={onReport}
          onCommentAdded={onCommentAdded}
          index={index}
          hasUserReported={checkHasReported(post)}
          onOpenReport={setReportingPostId}
        />
      ))}

      {/* Pagination Controls */}
      {posts.length > POSTS_PER_PAGE && (
        <div className="py-6 flex items-center justify-between gap-4 px-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={!canGoPrevious}
            className="gap-2 transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{currentPage + 1}</span>
            <span> / {totalPages}</span>
            <span className="block text-xs mt-1">
              Showing {startIndex + 1}–{Math.min(endIndex, posts.length)} of {posts.length} posts
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!canGoNext}
            className="gap-2 transition-all duration-200"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {posts.length === 0 && !loading && !error && (
        <div className="py-4">
          <p className="text-center text-sm text-muted-foreground">
            No posts available
          </p>
        </div>
      )}

      {/* Report Modal - Global Level */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
              setReportingPostId(null)
              setSelectedReason(null)
              setReportError(null)
            }}
          />

          {/* Modal */}
          <div className="relative w-full max-w-sm max-h-[85vh] rounded-xl border bg-card shadow-xl animate-in zoom-in-95 fade-in duration-300 flex flex-col overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => {
                setReportingPostId(null)
                setSelectedReason(null)
                setReportError(null)
              }}
              className="absolute top-4 right-4 z-10 p-1 rounded-lg hover:bg-muted transition-colors"
              aria-label="Close report modal"
            >
              <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-8">
              {reportSuccess ? (
                <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">Thank you!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your report helps keep our community safe.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="mb-2 text-lg font-semibold text-card-foreground flex items-center gap-2">
                    <Flag className="h-5 w-5 text-destructive" />
                    Report this post
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Help us understand what&apos;s wrong with this post.
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {REPORT_REASONS.map((reason) => (
                      <button
                        key={reason.value}
                        onClick={() => setSelectedReason(reason.value)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg border text-sm transition-all duration-200",
                          selectedReason === reason.value
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {reason.label}
                      </button>
                    ))}
                  </div>
                  
                  {reportError && (
                    <p className="mb-4 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                      {reportError}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Buttons - Fixed at Bottom */}
            {!reportSuccess && (
              <div className="border-t bg-card p-4 flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  className="flex-1 transition-all duration-200 hover:scale-[1.02]"
                  onClick={() => {
                    setReportingPostId(null)
                    setSelectedReason(null)
                    setReportError(null)
                  }}
                  disabled={isReporting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 transition-all duration-200 hover:scale-[1.02]"
                  onClick={handleReportSubmit}
                  disabled={!selectedReason || isReporting}
                >
                  {isReporting ? 'Reporting...' : 'Submit Report'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
