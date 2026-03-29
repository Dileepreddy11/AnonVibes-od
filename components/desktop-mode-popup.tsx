'use client'

import { useState, useEffect } from 'react'
import { X, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DesktopModePopup() {
  const [showPopup, setShowPopup] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already dismissed in this session
    const wasDismissed = sessionStorage.getItem('desktop_popup_dismissed')
    if (wasDismissed) {
      setDismissed(true)
      return
    }

    // Check if on mobile (screen width less than 768px)
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768
      // Also check if user agent suggests mobile
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      setShowPopup(isMobile || isMobileUA)
    }

    // Initial check
    checkMobile()

    // Listen for resize (in case user rotates device or changes window size)
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleDismiss = () => {
    setShowPopup(false)
    setDismissed(true)
    sessionStorage.setItem('desktop_popup_dismissed', 'true')
  }

  if (!showPopup || dismissed) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-card border rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-card-foreground">
                Better on Desktop
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                For the best experience, try viewing AnonVibes in desktop mode or on a larger screen.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="flex-1"
            >
              Continue anyway
            </Button>
            <Button
              size="sm"
              onClick={handleDismiss}
              className="flex-1"
            >
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
