'use client'

import { useState } from 'react'
import { Heart, Shield, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MyPostsModal } from './my-posts-modal'
import { useAuthContext } from './auth-provider'

export function Header() {
  const { user, username } = useAuthContext()
  const [showMyPosts, setShowMyPosts] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">MoodShare</h1>
              <p className="text-xs text-muted-foreground">Anonymous support</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* My Posts Button */}
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMyPosts(true)}
                className="gap-2 transition-all duration-200 hover:scale-105"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">My Posts</span>
              </Button>
            )}

            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                100% Anonymous
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* My Posts Modal */}
      {user && (
        <MyPostsModal
          isOpen={showMyPosts}
          onClose={() => setShowMyPosts(false)}
          userId={user.uid}
          username={username}
        />
      )}
    </>
  )
}
