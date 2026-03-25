'use client'

import { useState } from 'react'
import { useAuthContext } from './auth-provider'
import { usePosts } from '@/hooks/use-posts'
import { Header } from './header'
import { PostForm } from './post-form'
import { PostList } from './post-list'
import { MoodFilter } from './mood-filter'
import { MoodStats } from './mood-stats'
import { Spinner } from '@/components/ui/spinner'
import type { Mood } from '@/lib/types'
import { AlertCircle, Heart } from 'lucide-react'

export function CommunityFeed() {
  const { user, username, loading: authLoading, error: authError } = useAuthContext()
  const [moodFilter, setMoodFilter] = useState<Mood | null>(null)
  
  const {
    posts,
    loading: postsLoading,
    error: postsError,
    hasMore,
    loadingMore,
    loadMore,
    createPost,
    reportPost,
    incrementCommentCount,
  } = usePosts(moodFilter)

  const handleCreatePost = async (content: string, mood: Mood) => {
    if (!user) throw new Error('Not authenticated')
    await createPost(content, mood, user.uid, username)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4">
          <Heart className="h-8 w-8 text-primary-foreground" fill="currentColor" />
        </div>
        <Spinner className="mb-4 h-8 w-8" />
        <p className="text-muted-foreground">Setting up your safe space...</p>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>Unable to connect. Please check your internet connection and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Post Form */}
            <PostForm onSubmit={handleCreatePost} disabled={!user} />

            {/* Mood Filter */}
            <div className="overflow-x-auto pb-2">
              <MoodFilter selected={moodFilter} onSelect={setMoodFilter} />
            </div>

            {/* Posts */}
            <PostList
              posts={posts}
              loading={postsLoading}
              error={postsError}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
              userId={user?.uid}
              username={username}
              onReport={reportPost}
              onCommentAdded={incrementCommentCount}
            />
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <MoodStats />

              {/* Community Guidelines */}
              <div className="rounded-xl border bg-card p-4">
                <h3 className="mb-3 font-semibold text-card-foreground">
                  Community Guidelines
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    Be kind and supportive
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    Respect everyone&apos;s anonymity
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    Share genuinely, listen actively
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">4.</span>
                    Report harmful content
                  </li>
                </ul>
              </div>

              {/* Helpline Info */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">
                  If you&apos;re in crisis, please reach out:
                </p>
                <p className="mt-2 font-semibold text-primary">
                  988 Suicide & Crisis Lifeline
                </p>
                <p className="text-xs text-muted-foreground">
                  Call or text 988 (US)
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
