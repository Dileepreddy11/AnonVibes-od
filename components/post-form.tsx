'use client'

import { useState } from 'react'
import { MoodSelector } from './mood-selector'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { Mood } from '@/lib/types'
import { checkContentRealtime } from '@/lib/moderation'
import { cn } from '@/lib/utils'
import { Send, AlertCircle, AlertTriangle } from 'lucide-react'

interface PostFormProps {
  onSubmit: (content: string, mood: Mood) => Promise<void>
  disabled?: boolean
}

export function PostForm({ onSubmit, disabled }: PostFormProps) {
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<Mood | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Real-time content validation
  const contentCheck = checkContentRealtime(content)
  const hasValidationWarning = contentCheck.hasBadWords || contentCheck.hasNames

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || !mood || hasValidationWarning) return
    
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(content.trim(), mood)
      setContent('')
      setMood(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post')
    } finally {
      setIsSubmitting(false)
    }
  }

  const characterCount = content.length
  const maxCharacters = 1000
  const isOverLimit = characterCount > maxCharacters

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-card-foreground">
          How are you feeling?
        </label>
        <MoodSelector selected={mood} onSelect={setMood} />
      </div>

      <div className="mb-4">
        <label
          htmlFor="post-content"
          className="mb-2 block text-sm font-medium text-card-foreground"
        >
          Share your thoughts
        </label>
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? This is a safe space to express yourself..."
          className={cn(
            'min-h-[120px] w-full resize-none rounded-lg border bg-input p-3 text-foreground transition-all duration-200',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            isOverLimit && 'border-destructive focus:ring-destructive',
            hasValidationWarning && 'border-amber-500 focus:ring-amber-500/50'
          )}
          disabled={disabled || isSubmitting}
        />
        
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'text-xs transition-colors',
                isOverLimit ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {characterCount}/{maxCharacters}
            </span>
            {mood && (
              <span className="text-xs text-muted-foreground">
                Posting as anonymous
              </span>
            )}
          </div>

          {/* Real-time validation warnings */}
          {hasValidationWarning && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                {contentCheck.hasBadWords && (
                  <p className="text-amber-700 dark:text-amber-400">
                    <span className="font-medium">Inappropriate language detected:</span>{' '}
                    {contentCheck.badWordsFound.slice(0, 3).join(', ')}
                    {contentCheck.badWordsFound.length > 3 && '...'}
                  </p>
                )}
                {contentCheck.hasNames && (
                  <p className="text-amber-700 dark:text-amber-400">
                    <span className="font-medium">Real names detected:</span>{' '}
                    {contentCheck.namesFound.slice(0, 3).join(', ')}
                    {contentCheck.namesFound.length > 3 && '...'}
                    <span className="block text-xs mt-1 opacity-80">
                      Please avoid using real names to protect privacy
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in duration-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={!content.trim() || !mood || isOverLimit || disabled || isSubmitting || hasValidationWarning}
        className="w-full gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        {isSubmitting ? (
          <>
            <Spinner className="h-4 w-4" />
            Posting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Share Anonymously
          </>
        )}
      </Button>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Your identity is protected. Be kind and supportive to others.
      </p>
    </form>
  )
}
