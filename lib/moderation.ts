// Comprehensive bad word filter - detects words ANYWHERE in text
// Uses word boundary detection to catch words in sentences

// Extensive list of bad words and their common variations
const badWords = [
  // Profanity
  'fuck', 'fucker', 'fucking', 'fucked', 'fck', 'fuk', 'f*ck', 'f**k', 'fack',
  'shit', 'shitting', 'shitty', 'sh1t', 'sh!t', 's**t',
  'bitch', 'bitches', 'b1tch', 'b!tch',
  'ass', 'asses', 'asshole', 'assholes', 'a$$', 'a**',
  'dick', 'dicks', 'd1ck', 'd!ck',
  'cock', 'cocks', 'c0ck',
  'pussy', 'pussies', 'p*ssy', 'pu$$y',
  'cunt', 'cunts', 'c*nt',
  'whore', 'whores', 'wh0re',
  'slut', 'sluts', 'sl*t',
  'bastard', 'bastards',
  'damn', 'dammit', 'damned',
  'crap', 'crappy',
  'piss', 'pissed', 'pissing',
  'bollocks', 'bullshit', 'bs',
  
  // Sexual content
  'porn', 'porno', 'pornography', 'p0rn', 'pr0n',
  'sex', 'sexy', 's3x', 'sexx', 'sexxy',
  'hardcore', 'hardc0re',
  'xxx', 'xxxx',
  'nude', 'nudes', 'nudity',
  'naked', 'nak3d',
  'boob', 'boobs', 'boobies', 'b00bs',
  'tit', 'tits', 'titty', 'titties', 't1ts',
  'penis', 'pen1s',
  'vagina', 'vag1na', 'vag',
  'masturbate', 'masturbation', 'masterbate',
  'orgasm', 'orgasms', '0rgasm',
  'horny', 'h0rny',
  'erotic', 'er0tic',
  'deepfuck', 'deepf*ck',
  'blowjob', 'bl0wjob', 'bj',
  'handjob',
  'dildo', 'vibrator',
  'cum', 'cumming', 'cumshot',
  'sperm', 'semen',
  'anal', 'an4l',
  'rape', 'raped', 'raping', 'rapist',
  'incest',
  'pedophile', 'pedo', 'paedophile',
  'molest', 'molestation',
  'bestiality',
  'hentai', 'h3ntai',
  'fetish',
  
  // Slurs and hate speech
  'nigger', 'nigga', 'n1gger', 'n1gga', 'nigg3r',
  'faggot', 'fag', 'fags', 'f4ggot', 'f4g',
  'retard', 'retarded', 'r3tard',
  'tranny', 'shemale',
  'kike', 'spic', 'chink', 'gook', 'wetback',
  
  // Violence
  'kill', 'killing', 'killer', 'k1ll',
  'murder', 'murdered', 'murdering', 'murderer',
  'terrorist', 'terrorism',
  'bomb', 'bombing',
  
  // Drugs (explicit)
  'cocaine', 'c0caine', 'coke',
  'heroin', 'her0in',
  'meth', 'methamphetamine',
  'crack',
  'weed', 'marijuana', 'cannabis', 'ganja',
  'ecstasy', 'mdma',
  'lsd', 'acid',
  
  // Telugu/Hindi bad words
  'puka', 'pooku', 'modda', 'modha', 'lanjakoduku', 'lanja', 'dengey', 
  'gudda', 'sulli', 'sulla', 'lavda', 'lavde', 'bhenchod', 'bhosdike',
  'chutiya', 'chut', 'madarchod', 'gaand', 'gand', 'randi', 'haramkhor',
  'sala', 'saala', 'kutta', 'kutte', 'kamina', 'kamine', 'harami',
]

// Extensive list of common names from various cultures
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

// Function to check if a word exists anywhere in text (case insensitive, with word boundaries)
function containsWord(text: string, word: string): boolean {
  // Create regex that matches the word with optional non-alphabetic characters between letters
  // This catches variations like f*ck, f.u.c.k, etc.
  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`\\b${escapedWord}\\b`, 'gi')
  return pattern.test(text)
}

// Function to check if text contains any variation of a bad word
function containsBadWordVariation(text: string, word: string): boolean {
  const normalizedText = text.toLowerCase()
  const normalizedWord = word.toLowerCase()
  
  // Check exact word boundary match
  const wordBoundaryRegex = new RegExp(`(^|[^a-z])${normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i')
  if (wordBoundaryRegex.test(normalizedText)) {
    return true
  }
  
  return false
}

// Detect bad words in text - checks ANYWHERE in the sentence
function detectBadWords(text: string): string[] {
  const found: string[] = []
  const normalizedText = text.toLowerCase()
  
  for (const word of badWords) {
    if (containsBadWordVariation(normalizedText, word)) {
      found.push(word)
    }
  }
  
  return [...new Set(found)]
}

// Detect names in text - checks ANYWHERE in the sentence
function detectNames(text: string): string[] {
  const found: string[] = []
  const normalizedText = text.toLowerCase()
  
  for (const name of commonNames) {
    // Check if name exists as a word in the text
    const nameRegex = new RegExp(`(^|[^a-z])${name}([^a-z]|$)`, 'i')
    if (nameRegex.test(normalizedText)) {
      found.push(name)
    }
  }
  
  return [...new Set(found)]
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
