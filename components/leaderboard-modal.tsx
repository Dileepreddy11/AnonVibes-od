'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { db } from '@/lib/firebase'
import { collection, query, limit, onSnapshot } from 'firebase/firestore'
import { Trophy, Medal, Award, Calendar, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Post } from '@/lib/types'

interface LeaderboardModalProps {
  isOpen: boolean
  onClose: () => void
}

interface LeaderboardEntry {
  authorName: string
  postCount: number
  totalReactions: number
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly'>('daily')
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    if (!isOpen || !db) return

    setLoading(true)

    const postsRef = collection(db, 'posts')
    const q = query(postsRef, limit(500))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date()
      const periodStart = new Date()
      
      if (period === 'daily') {
        periodStart.setHours(0, 0, 0, 0)
      } else {
        // Weekly - start from Sunday
        const day = periodStart.getDay()
        periodStart.setDate(periodStart.getDate() - day)
        periodStart.setHours(0, 0, 0, 0)
      }

      // Filter posts by period and count by author
      const authorStats = new Map<string, { postCount: number; totalReactions: number }>()

      snapshot.docs.forEach((doc) => {
        const post = { id: doc.id, ...doc.data() } as Post
        const postDate = post.createdAt?.toDate?.()
        
        if (postDate && postDate >= periodStart && postDate <= now && !post.reported) {
          const current = authorStats.get(post.authorName) || { postCount: 0, totalReactions: 0 }
          const reactions = (post.reactionCounts?.support || 0) + 
                          (post.reactionCounts?.relate || 0) + 
                          (post.reactionCounts?.staystrong || 0)
          
          authorStats.set(post.authorName, {
            postCount: current.postCount + 1,
            totalReactions: current.totalReactions + reactions
          })
        }
      })

      // Convert to array and sort by post count, then by reactions
      const sorted = Array.from(authorStats.entries())
        .map(([authorName, stats]) => ({
          authorName,
          postCount: stats.postCount,
          totalReactions: stats.totalReactions
        }))
        .sort((a, b) => {
          if (b.postCount !== a.postCount) return b.postCount - a.postCount
          return b.totalReactions - a.totalReactions
        })
        .slice(0, 3)

      setLeaderboard(sorted)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [isOpen, period])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500 animate-bounce" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return null
    }
  }

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-yellow-500/20 border-yellow-500/30'
      case 1:
        return 'bg-gradient-to-r from-gray-400/20 via-gray-300/10 to-gray-400/20 border-gray-400/30'
      case 2:
        return 'bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-amber-600/20 border-amber-600/30'
      default:
        return 'bg-secondary/50'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top Contributors
          </DialogTitle>
          <DialogDescription className="sr-only">
            View the top 3 contributors for today or this week
          </DialogDescription>
        </DialogHeader>

        {/* Period Toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={period === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('daily')}
            className="flex-1 gap-2 transition-all duration-200"
          >
            <Calendar className="h-4 w-4" />
            Today
          </Button>
          <Button
            variant={period === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('weekly')}
            className="flex-1 gap-2 transition-all duration-200"
          >
            <Calendar className="h-4 w-4" />
            This Week
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 animate-in fade-in duration-500">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              No posts yet {period === 'daily' ? 'today' : 'this week'}.
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Be the first to contribute!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.authorName}
                className={cn(
                  'flex items-center gap-4 rounded-xl border p-4 transition-all duration-500',
                  getRankBg(index),
                  'animate-in fade-in slide-in-from-left-4',
                  'hover:scale-[1.02] hover:shadow-lg'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 shadow-inner">
                  {getRankIcon(index)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {entry.authorName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-primary">{entry.postCount}</span> posts
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-primary">{entry.totalReactions}</span> reactions
                    </span>
                  </div>
                </div>

                <div className="text-2xl font-bold text-muted-foreground/30">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground mt-4">
          Leaderboard resets {period === 'daily' ? 'every midnight' : 'every Sunday'}
        </p>
      </DialogContent>
    </Dialog>
  )
}
