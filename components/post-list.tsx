'use client'

import { useEffect, useRef, useCallback } from 'react'
import { PostCard } from './post-card'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import type { Post } from '@/lib/types'
import type { ReportReason } from '@/lib/moderation'
import { MessageSquareOff, RefreshCw } from 'lucide-react'

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
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !loadingMore) {
        onLoadMore()
      }
    },
    [hasMore, loadingMore, onLoadMore]
  )

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    })

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver])

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
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          userId={userId}
          username={username}
          onReport={onReport}
          onCommentAdded={onCommentAdded}
          index={index}
          hasUserReported={userId ? hasUserReported(post, userId) : false}
        />
      ))}

      <div ref={loadMoreRef} className="py-4">
        {loadingMore && (
          <div className="flex justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            You&apos;ve reached the end. Thanks for being here!
          </p>
        )}
      </div>
    </div>
  )
}
