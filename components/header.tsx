'use client'

import { useState } from 'react'
import { Heart, Shield, FileText, Trophy, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MyPostsModal } from './my-posts-modal'
import { LeaderboardModal } from './leaderboard-modal'
import { MyReportsModal } from './my-reports-modal'
import { useAuthContext } from './auth-provider'
import { cn } from '@/lib/utils'

export function Header() {
  const { user, username } = useAuthContext()
  const [showMyPosts, setShowMyPosts] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showReports, setShowReports] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3">
              <Heart className="h-5 w-5 text-primary-foreground transition-transform group-hover:scale-110" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                AnonVibes
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-wide">Express Freely</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {user && (
              <>
                {/* My Posts */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMyPosts(true)}
                  className={cn(
                    'gap-1.5 transition-all duration-300 hover:scale-105 hover:bg-primary/10',
                    'text-muted-foreground hover:text-primary'
                  )}
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">My Posts</span>
                </Button>

                {/* Leaderboard */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLeaderboard(true)}
                  className={cn(
                    'gap-1.5 transition-all duration-300 hover:scale-105 hover:bg-amber-500/10',
                    'text-muted-foreground hover:text-amber-500'
                  )}
                >
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Top 3</span>
                </Button>

                {/* My Reports */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReports(true)}
                  className={cn(
                    'gap-1.5 transition-all duration-300 hover:scale-105 hover:bg-secondary',
                    'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden lg:inline text-xs">Status</span>
                </Button>
              </>
            )}

            {/* Anonymous Badge */}
            <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-secondary to-secondary/80 px-3 py-1.5 ml-1 shadow-inner">
              <Shield className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                Anonymous
              </span>
            </div>
          </div>
        </div>

        {/* Subtle gradient line at bottom */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </header>

      {/* Modals */}
      {user && (
        <>
          <MyPostsModal
            isOpen={showMyPosts}
            onClose={() => setShowMyPosts(false)}
            userId={user.uid}
            username={username}
          />
          <LeaderboardModal
            isOpen={showLeaderboard}
            onClose={() => setShowLeaderboard(false)}
          />
          <MyReportsModal
            isOpen={showReports}
            onClose={() => setShowReports(false)}
            userId={user.uid}
          />
        </>
      )}
    </>
  )
}
