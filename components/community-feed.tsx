'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from './auth-provider'
import { usePosts } from '@/hooks/use-posts'
import { Header } from './header'
import { PostForm } from './post-form'
import { PostList } from './post-list'
import { MoodFilter } from './mood-filter'
import { MoodStats } from './mood-stats'
import { Spinner } from '@/components/ui/spinner'
import type { Mood } from '@/lib/types'
import { AlertCircle, Heart, Users, Archive } from 'lucide-react'
import { ArchiveModal } from './archive-modal'
import { DesktopModePopup } from './desktop-mode-popup'
import { Button } from '@/components/ui/button'

export function CommunityFeed() {
  const { user, username, loading: authLoading, error: authError } = useAuthContext()
  const [moodFilter, setMoodFilter] = useState<Mood | null>(null)
  const [liveUsersCount, setLiveUsersCount] = useState(11) // Start from 11 as requested
  const [showArchive, setShowArchive] = useState(false)
  
  // Simulate live users count (random fluctuation between 11-50)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsersCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1
        const newCount = prev + change
        // Keep between 11 and 50
        return Math.max(11, Math.min(50, newCount))
      })
    }, 5000) // Update every 5 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  const {
    posts,
    archivedPosts,
    loading: postsLoading,
    error: postsError,
    hasMore,
    loadingMore,
    loadMore,
    createPost,
    reportPost,
    incrementCommentCount,
    hasUserReported,
  } = usePosts(moodFilter)

  const handleCreatePost = async (content: string, mood: Mood) => {
    if (!user) throw new Error('Not authenticated')
    await createPost(content, mood, user.uid, username)
  }

  const handleReport = async (postId: string, reason: Parameters<typeof reportPost>[2]) => {
    if (!user) throw new Error('Not authenticated')
    return reportPost(postId, user.uid, reason)
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
      
      {/* Desktop Mode Popup for Mobile Users */}
      <DesktopModePopup />
      
      {/* Archive Modal */}
      <ArchiveModal
        isOpen={showArchive}
        onClose={() => setShowArchive(false)}
        posts={archivedPosts}
        userId={user?.uid}
        username={username}
      />
      
      {/* Live Users Counter - Top Right */}
      <div className="fixed top-16 right-3 z-30 flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 shadow-sm">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
        </span>
        <Users className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-medium text-primary">{liveUsersCount}</span>
      </div>
      
      <main className="mx-auto max-w-4xl w-full px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-[1fr,280px]">
          {/* Main Content */}
          <div className="flex flex-col gap-4">
            {/* Post Form */}
            <PostForm onSubmit={handleCreatePost} disabled={!user} />

            {/* Mood Filter + Archive Button */}
            <div className="flex items-center gap-2">
              <div className="flex-1 overflow-x-auto pb-1">
                <MoodFilter selected={moodFilter} onSelect={setMoodFilter} />
              </div>
              {archivedPosts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowArchive(true)}
                  className="flex-shrink-0 gap-1.5 text-xs"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Archive</span>
                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium">
                    {archivedPosts.length}
                  </span>
                </Button>
              )}
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
              onReport={handleReport}
              onCommentAdded={incrementCommentCount}
              hasUserReported={hasUserReported}
            />
            
            {/* Mobile Community Mood & Guidelines - After posts */}
            <div className="lg:hidden space-y-3 pt-4 border-t">
              <MoodStats />
              <div className="rounded-xl border bg-card p-3">
                <h3 className="mb-2 font-semibold text-card-foreground text-sm">
                  Community Guidelines
                </h3>
                <ul className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary font-medium">1.</span>
                    Be kind & supportive
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary font-medium">2.</span>
                    Respect anonymity
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary font-medium">3.</span>
                    Share genuinely
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary font-medium">4.</span>
                    Report harmful content
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
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
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
