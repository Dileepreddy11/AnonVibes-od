'use client'

import { Heart, Shield } from 'lucide-react'

export function Header() {
  return (
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

        <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground">
            100% Anonymous
          </span>
        </div>
      </div>
    </header>
  )
}
