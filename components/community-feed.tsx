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
        <div className="max-w-md space-y-4 text-center">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Firebase Setup Required</h2>
          <p className="text-muted-foreground">
            {authError.includes('invalid-api-key') 
              ? 'The Firebase API key appears to be invalid or Firebase services are not enabled.'
              : authError}
          </p>
          <div className="rounded-lg bg-muted p-4 text-left text-sm">
            <p className="font-medium mb-2">To fix this:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Go to Firebase Console</li>
              <li>Enable <strong>Anonymous Authentication</strong></li>
              <li>Create a <strong>Firestore Database</strong></li>
              <li>Verify the API key has no domain restrictions</li>
            </ol>
          </div>
          <a 
            href="https://console.firebase.google.com/project/citymate-1656a/authentication/providers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Open Firebase Console
          </a>
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
