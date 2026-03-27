// Comprehensive bad word filter with advanced detection
// Catches variations like: f u c k, f*ck, fuuuck, f.u.c.k, etc.

// Core bad words (we'll detect variations automatically)
const coreBadWords = [
  // English profanity
  'fuck', 'shit', 'bitch', 'ass', 'asshole', 'dick', 'cock', 'pussy', 'cunt',
  'whore', 'slut', 'bastard', 'damn', 'crap', 'piss', 'bollocks', 'bullshit',
  'fck', 'fuk', 'sht', 'btch', 'dck', 'pss',
  
  // Sexual content
  'porn', 'porno', 'pornography', 'sex', 'sexy', 'hardcore', 'xxx', 'nude', 
  'naked', 'boob', 'boobs', 'tit', 'tits', 'penis', 'vagina', 'masturbate',
  'orgasm', 'horny', 'erotic', 'deepfuck', 'blowjob', 'handjob', 'dildo',
  'cum', 'cumming', 'sperm', 'semen', 'anal', 'rape', 'incest', 'pedophile',
  'pedo', 'molest', 'hentai', 'fetish',
  
  // Slurs
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded', 'tranny',
  'kike', 'spic', 'chink', 'gook', 'wetback',
  
  // Violence
  'kill', 'murder', 'terrorist', 'terrorism',
  
  // Drugs
  'cocaine', 'heroin', 'meth', 'crack', 'ecstasy', 'mdma', 'lsd',
  
  // Telugu/Hindi bad words
  'puka', 'pooku', 'modda', 'modha', 'lanjakoduku', 'lanja', 'dengey',
  'gudda', 'sulli', 'sulla', 'lavda', 'lavde', 'bhenchod', 'bhosdike',
  'chutiya', 'chut', 'madarchod', 'gaand', 'gand', 'randi', 'haramkhor',
  'kamina', 'kamine', 'harami',
]

// Extensive list of common names
const commonNames = [
  // Indian names
  'aarav', 'aditya', 'akash', 'amit', 'amitabh', 'anand', 'anil', 'aniket', 'anirudh', 'anjali',
  'ankit', 'ankita', 'ananya', 'anu', 'anupam', 'arjun', 'arun', 'aryan', 'ashish', 'ashok',
  'bharat', 'bhavesh', 'chetan', 'chirag', 'deepak', 'deepika', 'dev', 'dhruv', 'dinesh', 'divya',
  'ganesh', 'gaurav', 'geeta', 'girish', 'gopal', 'govind', 'hari', 'harish', 'hemant', 'hitesh',
  'ishaan', 'jagdish', 'jai', 'jatin', 'jayesh', 'karan', 'karthik', 'kartik', 'kavita', 'kavya',
  'kishore', 'krishna', 'kumar', 'lakshmi', 'lata', 'madhav', 'manoj', 'manish', 'meera', 'milan',
  'mohit', 'mukesh', 'nandini', 'naresh', 'naveen', 'navya', 'neha', 'nikhil', 'nisha', 'nitin',
  'padma', 'pallavi', 'pankaj', 'pooja', 'prabhu', 'pradeep', 'prakash', 'pranav', 'prasad', 'pratik',
  'praveen', 'preeti', 'priya', 'priyanka', 'rahul', 'raj', 'rajat', 'rajeev', 'rajesh', 'raju',
  'rakesh', 'ram', 'ramesh', 'rani', 'ravi', 'ritesh', 'ritika', 'rohit', 'rohan', 'ruchi',
  'sachin', 'sahil', 'sai', 'sandeep', 'sanjay', 'sanjiv', 'sankar', 'santosh', 'sarita', 'satish',
  'shailesh', 'shashi', 'shekhar', 'shiv', 'shivam', 'shreya', 'shubham', 'simran', 'sneha', 'sonia',
  'sonu', 'srini', 'srinivas', 'sudhir', 'sujan', 'sunil', 'sunita', 'suraj', 'suresh', 'swati',
  'tanvi', 'tarun', 'tina', 'uday', 'uma', 'usha', 'varun', 'vijay', 'vikram', 'vinay',
  'vinod', 'vipin', 'virat', 'vishal', 'vivek', 'yash', 'yogesh',
  'mahesh', 'nagaraj', 'nagesh', 'pavan', 'phani', 'ramana', 'reddy', 'rao', 'sharma', 'singh',
  'varma', 'venkat', 'venu', 'chandra', 'lakshman', 'sita', 'radha', 'gita', 'durga', 'parvati',
  
  // Western names
  'aaron', 'adam', 'adrian', 'aiden', 'alan', 'albert', 'alex', 'alexander', 'alfred', 'alice',
  'amanda', 'amber', 'amy', 'andrea', 'andrew', 'angela', 'anna', 'anne', 'anthony', 'ashley',
  'benjamin', 'betty', 'bill', 'bob', 'brad', 'brandon', 'brian', 'bruce', 'carl', 'carlos',
  'carol', 'catherine', 'charles', 'charlotte', 'chris', 'christian', 'christina', 'christopher', 'claire', 'craig',
  'daniel', 'david', 'deborah', 'diana', 'donald', 'donna', 'dorothy', 'douglas', 'dylan', 'edward',
  'elizabeth', 'emily', 'emma', 'eric', 'ethan', 'eugene', 'eva', 'evelyn', 'frank', 'fred',
  'gary', 'george', 'gloria', 'grace', 'greg', 'hannah', 'harold', 'harry', 'heather', 'helen',
  'henry', 'jack', 'jacob', 'james', 'jane', 'janet', 'jason', 'jean', 'jeff', 'jennifer',
  'jeremy', 'jerry', 'jessica', 'jimmy', 'joan', 'joe', 'john', 'johnny', 'jonathan', 'joseph',
  'joshua', 'julia', 'julie', 'justin', 'karen', 'kate', 'katherine', 'kathleen', 'kathryn', 'keith',
  'kelly', 'kenneth', 'kevin', 'kim', 'kimberly', 'kyle', 'larry', 'laura', 'lauren', 'lawrence',
  'linda', 'lisa', 'logan', 'louis', 'lucas', 'margaret', 'maria', 'marie', 'marilyn', 'mark',
  'martha', 'martin', 'mary', 'mason', 'matthew', 'melissa', 'michael', 'michelle', 'mike', 'nancy',
  'nathan', 'nicholas', 'nicole', 'noah', 'oliver', 'olivia', 'pamela', 'patricia', 'patrick', 'paul',
  'peter', 'philip', 'rachel', 'ralph', 'randy', 'raymond', 'rebecca', 'richard', 'robert', 'roger',
  'ronald', 'rose', 'roy', 'russell', 'ruth', 'ryan', 'samantha', 'samuel', 'sandra', 'sara',
  'sarah', 'scott', 'sean', 'sharon', 'shirley', 'sophia', 'stephanie', 'stephen', 'steve', 'steven',
  'susan', 'teresa', 'terry', 'theresa', 'thomas', 'timothy', 'todd', 'tom', 'tony', 'travis',
  'tyler', 'victoria', 'vincent', 'virginia', 'walter', 'wayne', 'william', 'zachary',
  
  // Middle Eastern names
  'abdul', 'abdullah', 'ahmed', 'ali', 'amir', 'ayesha', 'bilal', 'fatima', 'hamza', 'hassan',
  'hussain', 'ibrahim', 'imran', 'karim', 'khalid', 'layla', 'mahmoud', 'mariam', 'mohammed', 'muhammad',
  'mustafa', 'nadia', 'noor', 'omar', 'osama', 'rania', 'rashid', 'salman', 'sara', 'tariq',
  'yasser', 'yusuf', 'zain', 'zahra', 'zainab',
  
  // East Asian names
  'chen', 'cheng', 'cho', 'choi', 'fang', 'feng', 'gao', 'guo', 'han', 'he',
  'hong', 'hu', 'huang', 'jia', 'jiang', 'jin', 'kim', 'lee', 'liang', 'lin',
  'liu', 'lu', 'luo', 'ma', 'mao', 'park', 'peng', 'qian', 'qin', 'shen',
  'shi', 'song', 'sun', 'tan', 'tang', 'tao', 'wang', 'wei', 'wu', 'xia',
  'xiao', 'xie', 'xu', 'yan', 'yang', 'yao', 'ye', 'yin', 'yu', 'yuan',
  'zhang', 'zhao', 'zheng', 'zhou', 'zhu',
  'akira', 'haruki', 'hiroshi', 'kenji', 'makoto', 'naoki', 'takashi', 'yuki', 'sakura', 'yui',
  'hana', 'mei', 'rin', 'aoi', 'hina', 'mio', 'riko', 'sora', 'yuna',
]

// Character substitution map for detecting leetspeak and variations
const charSubstitutions: { [key: string]: string[] } = {
  'a': ['a', '@', '4', '^', 'á', 'à', 'ä', 'â'],
  'b': ['b', '8', '6'],
  'c': ['c', '(', 'k', '<'],
  'd': ['d'],
  'e': ['e', '3', 'é', 'è', 'ë', 'ê'],
  'f': ['f', 'ph'],
  'g': ['g', '9', '6'],
  'h': ['h', '#'],
  'i': ['i', '1', '!', '|', 'í', 'ì', 'ï', 'î', 'l'],
  'j': ['j'],
  'k': ['k', 'c'],
  'l': ['l', '1', '|', 'i'],
  'm': ['m'],
  'n': ['n', 'ñ'],
  'o': ['o', '0', 'ó', 'ò', 'ö', 'ô', 'q'],
  'p': ['p'],
  'q': ['q'],
  'r': ['r'],
  's': ['s', '$', '5', 'z'],
  't': ['t', '7', '+'],
  'u': ['u', 'v', 'ú', 'ù', 'ü', 'û'],
  'v': ['v', 'u'],
  'w': ['w', 'vv'],
  'x': ['x'],
  'y': ['y', 'ý'],
  'z': ['z', '2', 's'],
}

// Normalize text by removing special chars, spaces, and converting substitutions
function normalizeText(text: string): string {
  let normalized = text.toLowerCase()
  
  // Remove spaces and special characters between letters
  // This catches "f u c k", "f.u.c.k", "f-u-c-k", etc.
  normalized = normalized.replace(/[\s\.\-\_\*\!\@\#\$\%\^\&\(\)\+\=\[\]\{\}\|\\\:\;\"\'\<\>\,\/\?\~\`]+/g, '')
  
  // Replace common substitutions
  for (const [letter, subs] of Object.entries(charSubstitutions)) {
    for (const sub of subs) {
      if (sub !== letter && sub.length === 1) {
        normalized = normalized.split(sub).join(letter)
      }
    }
  }
  
  // Remove repeated characters (fuuuuck -> fuck, shiiit -> shit)
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1')
  
  return normalized
}

// Check if normalized text contains a bad word
function containsBadWordNormalized(normalizedText: string, word: string): boolean {
  const normalizedWord = normalizeText(word)
  
  // Check if the word appears anywhere
  if (normalizedText.includes(normalizedWord)) {
    return true
  }
  
  // Also check for the word with double letters (common in bad words)
  const doubledWord = normalizedWord.replace(/(.)/g, '$1$1')
  if (normalizedText.includes(doubledWord)) {
    return true
  }
  
  return false
}

// Detect bad words with advanced pattern matching
function detectBadWords(text: string): string[] {
  const found: string[] = []
  const normalizedText = normalizeText(text)
  const originalLower = text.toLowerCase()
  
  for (const word of coreBadWords) {
    // Check normalized text (catches f u c k, f*ck, fuuuck, etc.)
    if (containsBadWordNormalized(normalizedText, word)) {
      found.push(word)
      continue
    }
    
    // Also check original text with word boundaries for exact matches
    const wordRegex = new RegExp(`(^|[^a-z])${word}([^a-z]|$)`, 'i')
    if (wordRegex.test(originalLower)) {
      found.push(word)
    }
  }
  
  return [...new Set(found)]
}

// Detect names in text
function detectNames(text: string): string[] {
  const found: string[] = []
  const words = text.toLowerCase().split(/[^a-zA-Z]+/)
  
  for (const word of words) {
    if (word.length < 2) continue
    
    // Check if word matches a name
    if (commonNames.includes(word)) {
      found.push(word)
    }
  }
  
  return [...new Set(found)]
}

// Replace names with generic terms
export function replaceNamesWithGeneric(text: string): { sanitized: string; namesFound: string[] } {
  const namesFound: string[] = []
  const words = text.split(/(\s+)/)
  const genericTerms = ['someone', 'a person', 'this person', 'an individual', 'people']
  let termIndex = 0
  
  const sanitized = words
    .map((word) => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '')
      
      if (commonNames.includes(cleanWord) && cleanWord.length > 1) {
        if (!namesFound.includes(cleanWord)) {
          namesFound.push(cleanWord)
        }
        // Use rotating generic terms for variety
        const genericTerm = genericTerms[termIndex % genericTerms.length]
        termIndex++
        return genericTerm
      }
      
      return word
    })
    .join('')
  
  return { sanitized, namesFound }
}

export function containsBadWords(text: string): boolean {
  return detectBadWords(text).length > 0
}

export function containsNames(text: string): boolean {
  return detectNames(text).length > 0
}

export function getBadWordsInText(text: string): string[] {
  return detectBadWords(text)
}

export function getNamesInText(text: string): string[] {
  return detectNames(text)
}

export interface ContentValidation {
  valid: boolean
  error?: string
  hasBadWords: boolean
  hasNames: boolean
  badWordsFound: string[]
  namesFound: string[]
  sanitized: string
}

export function validateContent(content: string): ContentValidation {
  const result: ContentValidation = {
    valid: true,
    hasBadWords: false,
    hasNames: false,
    badWordsFound: [],
    namesFound: [],
    sanitized: content,
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
  
  // If names are found, sanitize them automatically
  if (result.hasNames) {
    const { sanitized, namesFound: detectedNames } = replaceNamesWithGeneric(content)
    result.sanitized = sanitized
    result.namesFound = detectedNames
    // Still valid, just with auto-replaced names
    result.valid = true
    return result
  }
  
  return result
}

// Real-time content check
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

// Rate limiting
const RATE_LIMIT_KEY = 'post_timestamps'
const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_MAX = 3

export function checkRateLimit(): { allowed: boolean; waitTime?: number } {
  if (typeof window === 'undefined') return { allowed: true }
  
  const now = Date.now()
  const storedTimestamps = localStorage.getItem(RATE_LIMIT_KEY)
  let timestamps: number[] = storedTimestamps ? JSON.parse(storedTimestamps) : []
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
  timestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW)
  timestamps.push(now)
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps))
}

// Report reasons
export const REPORT_REASONS = [
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'hate', label: 'Hate speech' },
  { value: 'violence', label: 'Violence or threats' },
  { value: 'other', label: 'Other' },
] as const

export type ReportReason = typeof REPORT_REASONS[number]['value']

// Report threshold - after this many reports, post is hidden
export const REPORT_THRESHOLD = 5
