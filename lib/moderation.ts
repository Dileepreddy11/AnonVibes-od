// Comprehensive bad word filter using patterns to catch variations
// This catches leetspeak, character substitutions, and common evasions

const badWordPatterns = [
  // Core profanity with common variations
  /f+[u\*@0]+c+k+/gi,
  /f+[^\w]*u+[^\w]*c+[^\w]*k+/gi,
  /sh[i1!]+t+/gi,
  /b[i1!]+t+ch/gi,
  /a+[s\$]+[s\$]+h*o*l*e*/gi,
  /d[i1!]+c+k+/gi,
  /c+[o0]+c+k+/gi,
  /p+[u\*]+s+[s\$]+y+/gi,
  /c+[u\*]+n+t+/gi,
  /wh+[o0]+r+e+/gi,
  /sl+[u\*]+t+/gi,
  /b+a+st+a+r+d+/gi,
  /d+a+m+n+/gi,
  
  // Sexual content patterns
  /p+[o0]+r+n+/gi,
  /s+[e3]+x+y*/gi,
  /h+a+r+d+c+[o0]+r+e+/gi,
  /x+x+x+/gi,
  /n+[u\*]+d+e+/gi,
  /n+a+k+[e3]+d+/gi,
  /b+[o0]+[o0]+b+s*/gi,
  /t+[i1]+t+s*/gi,
  /p+[e3]+n+[i1]+s+/gi,
  /v+a+g+[i1]+n+a+/gi,
  /m+a+st+[u\*]+r+b+/gi,
  /[o0]+r+g+a+s+m+/gi,
  /h+[o0]+r+n+y+/gi,
  /er+[o0]+t+[i1]+c+/gi,
  /d+[e3]+[e3]+p+f+/gi,
  
  // Slurs and hate speech
  /n+[i1]+g+[g]+[ae3]+r*/gi,
  /f+a+g+[g]*[o0]*t*/gi,
  /r+[e3]+t+a+r+d+/gi,
  
  // Violence related
  /r+a+p+[e3]+/gi,
  /k+[i1]+l+l+/gi,
  /m+[u\*]+r+d+[e3]+r+/gi,
  
  // Drugs
  /c+[o0]+c+a+[i1]+n+[e3]*/gi,
  /h+[e3]+r+[o0]+[i1]+n+/gi,
  /m+[e3]+t+h+/gi,
]

// Function to detect bad words using patterns
function detectBadWordsWithPatterns(text: string): string[] {
  const found: string[] = []
  
  for (const pattern of badWordPatterns) {
    const matches = text.match(pattern)
    if (matches) {
      found.push(...matches)
    }
  }
  
  return [...new Set(found.map(w => w.toLowerCase()))]
}

// Comprehensive name detection - detects capitalized words that look like names
// This catches most human names without needing a huge list
function detectPotentialNames(text: string): string[] {
  // Pattern to match capitalized words that are likely names
  // Excludes common English words that are capitalized
  const commonWords = new Set([
    'i', 'a', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'need', 'dare', 'ought', 'used',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
    'happy', 'sad', 'angry', 'stressed', 'confused', 'feeling', 'feel', 'today',
    'yesterday', 'tomorrow', 'morning', 'evening', 'night', 'day', 'week', 'month',
    'year', 'time', 'life', 'work', 'school', 'home', 'family', 'friend', 'friends',
    'love', 'hate', 'help', 'support', 'care', 'thanks', 'thank', 'please', 'sorry',
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december', 'god', 'anyone', 'someone',
    'everyone', 'nobody', 'anybody', 'somebody', 'everybody', 'nothing', 'something',
    'everything', 'anything', 'people', 'person', 'man', 'woman', 'child', 'children',
  ])
  
  // Match words that start with capital letter (potential names)
  const capitalizedWords = text.match(/\b[A-Z][a-z]{2,}\b/g) || []
  
  // Filter out common words
  const potentialNames = capitalizedWords.filter(word => 
    !commonWords.has(word.toLowerCase()) && 
    word.length >= 3 && 
    word.length <= 20
  )
  
  return [...new Set(potentialNames)]
}

// Known name patterns (common first names from various cultures)
const knownNamePatterns = [
  // These are regex patterns to catch common name patterns
  /\b(raj|rahul|rohit|virat|sachin|amit|anil|vijay|ravi|kumar|arjun|karthik|arun|sanjay)\b/gi,
  /\b(priya|anjali|pooja|neha|deepika|ananya|sneha|kavya|divya|meera|lakshmi|padma)\b/gi,
  /\b(suresh|ramesh|mahesh|rajesh|ganesh|mukesh|dinesh|naresh|hitesh|ritesh)\b/gi,
  /\b(john|james|michael|david|robert|william|richard|joseph|thomas|charles)\b/gi,
  /\b(mary|jennifer|linda|sarah|jessica|emily|ashley|amanda|stephanie|nicole)\b/gi,
  /\b(mohammed|muhammad|ahmed|ali|omar|hassan|hussain|ibrahim|yusuf|khalid)\b/gi,
  /\b(wei|chen|zhang|wang|li|liu|yang|huang|zhao|wu|zhou|xu|sun|ma)\b/gi,
]

function detectKnownNames(text: string): string[] {
  const found: string[] = []
  
  for (const pattern of knownNamePatterns) {
    const matches = text.match(pattern)
    if (matches) {
      found.push(...matches)
    }
  }
  
  return [...new Set(found.map(w => w.toLowerCase()))]
}

export function containsBadWords(text: string): boolean {
  return detectBadWordsWithPatterns(text).length > 0
}

export function containsNames(text: string): boolean {
  const knownNames = detectKnownNames(text)
  const potentialNames = detectPotentialNames(text)
  return knownNames.length > 0 || potentialNames.length > 0
}

export function getBadWordsInText(text: string): string[] {
  return detectBadWordsWithPatterns(text)
}

export function getNamesInText(text: string): string[] {
  const knownNames = detectKnownNames(text)
  const potentialNames = detectPotentialNames(text)
  return [...new Set([...knownNames, ...potentialNames])]
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
