'use client'

import { useState, useEffect } from 'react'
import { collection, query, limit, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { MoodBadge } from './mood-badge'
import { ReactionButtons } from './reaction-buttons'
import { CommentSection } from './comment-section'
import type { Post } from '@/lib/types'
import type { Timestamp } from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import { X, Trash2, FileText, ArrowLeft, MessageCircle, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MyPostsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  username: string
}

export function MyPostsModal({ isOpen, onClose, userId, username }: MyPostsModalProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  useEffect(() => {
    if (!isOpen || !userId) return

    const fetchMyPosts = async () => {
      setLoading(true)
      try {
        const postsRef = collection(db, 'posts')
        const q = query(postsRef, limit(200))
        const snapshot = await getDocs(q)

        const myPosts = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
          .filter((post) => post.authorId === userId && !post.reported) as Post[]

        // Sort by createdAt descending
        myPosts.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0
          return bTime - aTime
        })

        setPosts(myPosts)
      } catch (err) {
        console.error('Error fetching my posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMyPosts()
  }, [isOpen, userId])

  const handleDelete = async (postId: string) => {
    setDeletingId(postId)
    try {
      await deleteDoc(doc(db, 'posts', postId))
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setConfirmDeleteId(null)
      if (selectedPost?.id === postId) {
        setSelectedPost(null)
      }
    } catch (err) {
      console.error('Error deleting post:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleClose = () => {
    setSelectedPost(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[85vh] rounded-xl border bg-card shadow-xl animate-in zoom-in-95 fade-in duration-300 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            {selectedPost ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPost(null)}
                className="h-8 w-8 p-0 rounded-full mr-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
            ) : (
              <FileText className="h-5 w-5 text-primary" />
            )}
            <div>
              <h2 className="font-semibold text-card-foreground">
                {selectedPost ? 'Post Details' : 'My Posts'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {selectedPost ? 'View comments and reactions' : `Posting as ${username}`}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner className="h-8 w-8 mb-4" />
              <p className="text-muted-foreground">Loading your posts...</p>
            </div>
          ) : selectedPost ? (
            // Post Detail View
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto">
              {/* Post Content */}
              <div className="rounded-lg border bg-secondary/30 p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <MoodBadge mood={selectedPost.mood} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {selectedPost.createdAt &&
                      formatDistanceToNow(
                        (selectedPost.createdAt as Timestamp).toDate(),
                        { addSuffix: true }
                      )}
                  </span>
                </div>
                
                <p className="text-foreground whitespace-pre-wrap mb-4 leading-relaxed">
                  {selectedPost.content}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 pb-4 border-b">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {selectedPost.reactionCounts.support +
                      selectedPost.reactionCounts.relate +
                      selectedPost.reactionCounts.staystrong}{' '}
                    reactions
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {selectedPost.commentCount} comments
                  </span>
                </div>

                {/* Reactions */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Reactions</p>
                  <ReactionButtons
                    postId={selectedPost.id}
                    userId={userId}
                    reactionCounts={selectedPost.reactionCounts}
                  />
                </div>

                {/* Delete Button */}
                <div className="pt-3 border-t">
                  {confirmDeleteId === selectedPost.id ? (
                    <div className="flex items-center justify-between gap-2 animate-in fade-in duration-200">
                      <span className="text-sm text-muted-foreground">Delete this post?</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-8"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(selectedPost.id)}
                          disabled={deletingId === selectedPost.id}
                          className="h-8"
                        >
                          {deletingId === selectedPost.id ? (
                            <Spinner className="h-3 w-3" />
                          ) : (
                            'Delete'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDeleteId(selectedPost.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Post
                    </Button>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-medium text-sm text-card-foreground mb-3 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Comments
                </h3>
                <CommentSection
                  postId={selectedPost.id}
                  userId={userId}
                  username={username}
                  initialCommentCount={selectedPost.commentCount}
                  defaultExpanded={true}
                />
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-card-foreground mb-1">
                No posts yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Share your first thought with the community!
              </p>
            </div>
          ) : (
            // Posts List - Scrollable
            <div className="space-y-3">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className={cn(
                    'rounded-lg border bg-secondary/30 p-4 transition-all duration-300 cursor-pointer',
                    'hover:bg-secondary/50 hover:shadow-sm hover:border-primary/20',
                    'animate-in fade-in slide-in-from-bottom-2'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <MoodBadge mood={post.mood} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {post.createdAt &&
                          formatDistanceToNow(
                            (post.createdAt as Timestamp).toDate(),
                            { addSuffix: true }
                          )}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirmDeleteId === post.id) {
                          handleDelete(post.id)
                        } else {
                          setConfirmDeleteId(post.id)
                        }
                      }}
                      className={cn(
                        'h-7 px-2 text-xs',
                        confirmDeleteId === post.id 
                          ? 'text-destructive-foreground bg-destructive hover:bg-destructive/90' 
                          : 'text-muted-foreground hover:text-destructive'
                      )}
                    >
                      {deletingId === post.id ? (
                        <Spinner className="h-3 w-3" />
                      ) : confirmDeleteId === post.id ? (
                        'Confirm'
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3 mb-3">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {post.reactionCounts.support +
                          post.reactionCounts.relate +
                          post.reactionCounts.staystrong}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {post.commentCount}
                      </span>
                    </div>
                    <span className="text-primary text-xs">Tap to view</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!selectedPost && posts.length > 0 && (
          <div className="border-t p-3 text-center flex-shrink-0">
            <p className="text-xs text-muted-foreground">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'} total
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
