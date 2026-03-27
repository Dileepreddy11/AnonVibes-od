'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { db } from '@/lib/firebase'
import { collection, query, limit, onSnapshot } from 'firebase/firestore'
import { AlertTriangle, ShieldCheck, ShieldAlert, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MyReportsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

const REPORT_THRESHOLD = 10 // Number of reports before account warning
const BAN_THRESHOLD = 20 // Number of reports before account ban

export function MyReportsModal({ isOpen, onClose, userId }: MyReportsModalProps) {
  const [loading, setLoading] = useState(true)
  const [reportCount, setReportCount] = useState(0)
  const [isBanned, setIsBanned] = useState(false)

  useEffect(() => {
    if (!isOpen || !db || !userId) return

    setLoading(true)

    // Check user's report count from posts
    const postsRef = collection(db, 'posts')
    const q = query(postsRef, limit(500))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalReports = 0

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (data.authorId === userId && data.reportCount) {
          totalReports += data.reportCount
        }
      })

      setReportCount(totalReports)
      setIsBanned(totalReports >= BAN_THRESHOLD)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [isOpen, userId])

  const getStatusInfo = () => {
    if (isBanned) {
      return {
        icon: <ShieldAlert className="h-16 w-16 text-destructive animate-pulse" />,
        title: 'Account Restricted',
        description: 'Your account has been restricted due to multiple reports. Please contact support.',
        color: 'text-destructive',
        bg: 'bg-destructive/10 border-destructive/30'
      }
    }
    if (reportCount >= REPORT_THRESHOLD) {
      return {
        icon: <AlertTriangle className="h-16 w-16 text-amber-500 animate-bounce" />,
        title: 'Warning',
        description: `You have ${reportCount} reports. Please be mindful of community guidelines.`,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10 border-amber-500/30'
      }
    }
    return {
      icon: <ShieldCheck className="h-16 w-16 text-primary animate-in zoom-in duration-500" />,
      title: 'Good Standing',
      description: 'Your account is in good standing. Keep being supportive!',
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/30'
    }
  }

  const status = getStatusInfo()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Account Status
          </DialogTitle>
          <DialogDescription className="sr-only">
            View your account standing and report count
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className={cn(
              'flex flex-col items-center justify-center p-6 rounded-xl border transition-all duration-500',
              status.bg
            )}>
              {status.icon}
              <h3 className={cn('mt-4 text-lg font-semibold', status.color)}>
                {status.title}
              </h3>
              <p className="text-sm text-muted-foreground text-center mt-2">
                {status.description}
              </p>
            </div>

            {/* Report Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Reports Received</span>
                <span className={cn(
                  'font-medium',
                  reportCount >= BAN_THRESHOLD ? 'text-destructive' :
                  reportCount >= REPORT_THRESHOLD ? 'text-amber-500' : 'text-primary'
                )}>
                  {reportCount} / {BAN_THRESHOLD}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full transition-all duration-1000 ease-out rounded-full',
                    reportCount >= BAN_THRESHOLD ? 'bg-destructive' :
                    reportCount >= REPORT_THRESHOLD ? 'bg-amber-500' : 'bg-primary'
                  )}
                  style={{ width: `${Math.min((reportCount / BAN_THRESHOLD) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="text-xs text-center text-muted-foreground bg-secondary/50 rounded-lg p-3">
              <p>Be kind and supportive to maintain good standing.</p>
              <p className="mt-1 opacity-70">
                Accounts with {BAN_THRESHOLD}+ reports may be restricted.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
