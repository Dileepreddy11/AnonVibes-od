'use client'

import { useState } from 'react'
import { MoodSelector } from './mood-selector'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { Mood } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Send, AlertCircle } from 'lucide-react'

interface PostFormProps {
  onSubmit: (content: string, mood: Mood) => Promise<void>
  disabled?: boolean
}

export function PostForm({ onSubmit, disabled }: PostFormProps) {
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<Mood | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || !mood) return
    
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
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-4 shadow-sm">
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
          placeholder="What&apos;s on your mind? This is a safe space to express yourself..."
          className={cn(
            'min-h-[120px] w-full resize-none rounded-lg border bg-input p-3 text-foreground',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            isOverLimit && 'border-destructive focus:ring-destructive'
          )}
          disabled={disabled || isSubmitting}
        />
        <div className="mt-1 flex items-center justify-between">
          <span
            className={cn(
              'text-xs',
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
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={!content.trim() || !mood || isOverLimit || disabled || isSubmitting}
        className="w-full gap-2"
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
