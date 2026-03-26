// Comprehensive bad word filter
const badWords = [
  // Profanity
  'fuck', 'fucking', 'fucked', 'fucker', 'fck', 'f*ck', 'fuk',
  'shit', 'sh*t', 'bullshit', 'shitting',
  'ass', 'asshole', 'a$$',
  'bitch', 'b*tch', 'bitches',
  'damn', 'dammit',
  'crap', 'dick', 'd*ck', 'cock', 'c*ck',
  'pussy', 'p*ssy', 'cunt', 'c*nt',
  'bastard', 'whore', 'slut',
  // Sexual content
  'sex', 'sexy', 's*x', 'porn', 'porno', 'p*rn',
  'hardcore', 'deepfuck', 'xxx', 'nude', 'naked',
  'boobs', 'tits', 'penis', 'vagina',
  'masturbate', 'orgasm', 'horny',
  // Hate/violence
  'hate', 'kill', 'murder', 'rape', 'racist',
  'nigger', 'nigga', 'faggot', 'fag',
  // Spam/scam
  'spam', 'scam', 'fake', 'fraud',
  // Drugs
  'cocaine', 'heroin', 'meth', 'weed', 'marijuana',
]

// Common Indian and international names to filter (optional - can be disabled)
const commonNames = [
  // Indian names
  'suresh', 'ramesh', 'mahesh', 'rajesh', 'virat', 'rohit', 'sachin',
  'priya', 'anjali', 'pooja', 'neha', 'deepika', 'ananya',
  'amit', 'anil', 'vijay', 'ravi', 'kumar', 'sharma', 'singh',
  'rahul', 'akash', 'arjun', 'karthik', 'arun', 'sanjay',
  // Common western names
  'john', 'james', 'michael', 'david', 'robert', 'william',
  'mary', 'jennifer', 'linda', 'sarah', 'jessica', 'emily',
]

// Create regex for bad words (case insensitive, word boundaries)
const badWordRegex = new RegExp(`\\b(${badWords.join('|')})\\b`, 'gi')

// Create regex for names (case insensitive, word boundaries)
const nameRegex = new RegExp(`\\b(${commonNames.join('|')})\\b`, 'gi')

export function containsBadWords(text: string): boolean {
  return badWordRegex.test(text)
}

export function containsNames(text: string): boolean {
  return nameRegex.test(text)
}

export function getBadWordsInText(text: string): string[] {
  const matches = text.match(badWordRegex)
  return matches ? [...new Set(matches.map(m => m.toLowerCase()))] : []
}

export function getNamesInText(text: string): string[] {
  const matches = text.match(nameRegex)
  return matches ? [...new Set(matches.map(m => m.toLowerCase()))] : []
}

export function sanitizeContent(text: string): string {
  return text.replace(badWordRegex, '***')
}

export interface ContentValidation {
  valid: boolean
  error?: string
  hasBadWords: boolean
  hasNames: boolean
  badWordsFound: string[]
  namesFound: string[]
}

export function validateContent(content: string): ContentValidation {
  const result: ContentValidation = {
    valid: true,
    hasBadWords: false,
    hasNames: false,
    badWordsFound: [],
    namesFound: [],
  }

  if (!content.trim()) {
    return { ...result, valid: false, error: 'Content cannot be empty' }
  }
  
  if (content.length < 5) {
    return { ...result, valid: false, error: 'Content is too short (minimum 5 characters)' }
  }
  
  if (content.length > 1000) {
    return { ...result, valid: false, error: 'Content is too long (maximum 1000 characters)' }
  }
  
  const badWordsFound = getBadWordsInText(content)
  const namesFound = getNamesInText(content)
  
  result.hasBadWords = badWordsFound.length > 0
  result.hasNames = namesFound.length > 0
  result.badWordsFound = badWordsFound
  result.namesFound = namesFound

  if (result.hasBadWords) {
    return { 
      ...result, 
      valid: false, 
      error: 'Please avoid using inappropriate language' 
    }
  }
  
  if (result.hasNames) {
    return { 
      ...result, 
      valid: false, 
      error: 'Please avoid using real names to protect privacy' 
    }
  }
  
  return result
}

// Real-time content check (for showing warnings while typing)
export function checkContentRealtime(content: string): {
  hasBadWords: boolean
  hasNames: boolean
  badWordsFound: string[]
  namesFound: string[]
} {
  const badWordsFound = getBadWordsInText(content)
  const namesFound = getNamesInText(content)
  
  return {
    hasBadWords: badWordsFound.length > 0,
    hasNames: namesFound.length > 0,
    badWordsFound,
    namesFound,
  }
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
