// Basic bad word filter - extend as needed
const badWords = [
  'spam', 'scam', 'fake', 'hate',
  // Add more words as needed
]

const badWordRegex = new RegExp(`\\b(${badWords.join('|')})\\b`, 'gi')

export function containsBadWords(text: string): boolean {
  return badWordRegex.test(text)
}

export function sanitizeContent(text: string): string {
  return text.replace(badWordRegex, '***')
}

export function validateContent(content: string): { valid: boolean; error?: string } {
  if (!content.trim()) {
    return { valid: false, error: 'Content cannot be empty' }
  }
  
  if (content.length < 5) {
    return { valid: false, error: 'Content is too short (minimum 5 characters)' }
  }
  
  if (content.length > 1000) {
    return { valid: false, error: 'Content is too long (maximum 1000 characters)' }
  }
  
  if (containsBadWords(content)) {
    return { valid: false, error: 'Please keep the content supportive and respectful' }
  }
  
  return { valid: true }
}

// Rate limiting for posts (stored in localStorage)
const RATE_LIMIT_KEY = 'post_timestamps'
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 3 // 3 posts per minute

export function checkRateLimit(): { allowed: boolean; waitTime?: number } {
  if (typeof window === 'undefined') {
    return { allowed: true }
  }
  
  const now = Date.now()
  const storedTimestamps = localStorage.getItem(RATE_LIMIT_KEY)
  let timestamps: number[] = storedTimestamps ? JSON.parse(storedTimestamps) : []
  
  // Remove old timestamps
  timestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
  
  if (timestamps.length >= RATE_LIMIT_MAX) {
    const oldestTimestamp = Math.min(...timestamps)
    const waitTime = RATE_LIMIT_WINDOW - (now - oldestTimestamp)
    return { allowed: false, waitTime }
  }
  
  return { allowed: true }
}

export function recordPost(): void {
  if (typeof window === 'undefined') return
  
  const now = Date.now()
  const storedTimestamps = localStorage.getItem(RATE_LIMIT_KEY)
  let timestamps: number[] = storedTimestamps ? JSON.parse(storedTimestamps) : []
  
  // Remove old timestamps and add new one
  timestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
  timestamps.push(now)
  
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps))
}
