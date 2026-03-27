'use client'

import { useState, useEffect } from 'react'
import { collection, query, limit, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { MoodBadge } from './mood-badge'
import type { Post } from '@/lib/types'
import type { Timestamp } from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import { X, Trash2, FileText, AlertCircle } from 'lucide-react'
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
    } catch (err) {
      console.error('Error deleting post:', err)
    } finally {
      setDeletingId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[80vh] rounded-xl border bg-card shadow-xl animate-in zoom-in-95 fade-in duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <h2 className="font-semibold text-card-foreground">My Posts</h2>
              <p className="text-xs text-muted-foreground">
                Posting as {username}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner className="h-8 w-8 mb-4" />
              <p className="text-muted-foreground">Loading your posts...</p>
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
            <div className="space-y-3">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className={cn(
                    'rounded-lg border bg-secondary/30 p-4 transition-all duration-300',
                    'hover:bg-secondary/50 hover:shadow-sm',
                    'animate-in fade-in slide-in-from-bottom-2'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
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

                    {confirmDeleteId === post.id ? (
                      <div className="flex items-center gap-1 animate-in fade-in duration-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-7 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="h-7 text-xs"
                        >
                          {deletingId === post.id ? (
                            <Spinner className="h-3 w-3" />
                          ) : (
                            'Delete'
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDeleteId(post.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete post</span>
                      </Button>
                    )}
                  </div>

                  <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">
                    {post.content}
                  </p>

                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {post.reactionCounts.support +
                        post.reactionCounts.relate +
                        post.reactionCounts.staystrong}{' '}
                      reactions
                    </span>
                    <span>{post.commentCount} comments</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {posts.length > 0 && (
          <div className="border-t p-3 text-center">
            <p className="text-xs text-muted-foreground">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'} total
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
