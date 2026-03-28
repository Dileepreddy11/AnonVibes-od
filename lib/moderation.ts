// Comprehensive bad word filter with advanced detection
// Catches variations like: f u c k, f*ck, fuuuck, f.u.c.k, etc.

// Common English words dictionary for language detection
const commonEnglishWords = new Set([
  // Common words
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
  'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
  'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
  'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
  'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
  'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'am', 'are', 'was',
  'were', 'been', 'being', 'has', 'had', 'having', 'does', 'did', 'doing', 'should', 'could',
  'would', 'might', 'must', 'shall', 'need', 'dare', 'ought', 'used', 'here', 'there', 'where',
  'why', 'when', 'how', 'what', 'which', 'who', 'whom', 'whose', 'yes', 'no', 'maybe', 'please',
  'thank', 'thanks', 'sorry', 'excuse', 'hello', 'hi', 'hey', 'bye', 'goodbye', 'welcome',
  // Feelings and emotions
  'happy', 'sad', 'angry', 'fear', 'love', 'hate', 'joy', 'hope', 'worry', 'stress', 'peace',
  'calm', 'anxious', 'excited', 'bored', 'tired', 'lonely', 'proud', 'shame', 'guilt', 'envy',
  'jealous', 'grateful', 'content', 'depressed', 'confused', 'curious', 'surprised', 'shocked',
  'disappointed', 'frustrated', 'overwhelmed', 'relieved', 'nervous', 'scared', 'terrified',
  'feeling', 'feel', 'felt', 'emotion', 'mood', 'heart', 'soul', 'mind', 'thought', 'dream',
  // Common verbs
  'help', 'need', 'try', 'let', 'keep', 'put', 'set', 'seem', 'ask', 'show', 'hear', 'play',
  'run', 'move', 'live', 'believe', 'hold', 'bring', 'happen', 'write', 'provide', 'sit', 'stand',
  'lose', 'pay', 'meet', 'include', 'continue', 'learn', 'change', 'lead', 'understand', 'watch',
  'follow', 'stop', 'create', 'speak', 'read', 'allow', 'add', 'spend', 'grow', 'open', 'walk',
  'win', 'offer', 'remember', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect',
  'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain', 'suggest', 'raise', 'pass', 'sell',
  'require', 'report', 'decide', 'pull', 'support', 'share', 'today', 'tonight', 'tomorrow',
  // Common nouns
  'man', 'woman', 'child', 'children', 'boy', 'girl', 'friend', 'family', 'mother', 'father',
  'brother', 'sister', 'son', 'daughter', 'husband', 'wife', 'parent', 'home', 'house', 'room',
  'school', 'student', 'teacher', 'book', 'word', 'story', 'night', 'morning', 'evening',
  'life', 'world', 'country', 'city', 'place', 'thing', 'person', 'part', 'problem', 'fact',
  'group', 'company', 'system', 'program', 'question', 'government', 'number', 'point', 'hand',
  'water', 'money', 'food', 'car', 'job', 'office', 'door', 'phone', 'computer', 'game',
  // Common adjectives
  'great', 'little', 'own', 'old', 'right', 'big', 'high', 'different', 'small', 'large', 'next',
  'early', 'young', 'important', 'few', 'public', 'bad', 'same', 'able', 'free', 'sure', 'true',
  'false', 'real', 'full', 'special', 'hard', 'easy', 'clear', 'recent', 'certain', 'personal',
  'open', 'possible', 'late', 'dark', 'light', 'strong', 'weak', 'best', 'better', 'worse', 'worst',
  // Common adverbs
  'very', 'really', 'always', 'never', 'often', 'sometimes', 'usually', 'still', 'already', 'again',
  'too', 'enough', 'almost', 'actually', 'probably', 'maybe', 'perhaps', 'definitely', 'certainly',
  // Pronouns and determiners
  'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves', 'each', 'every',
  'both', 'few', 'more', 'most', 'several', 'such', 'much', 'many', 'another', 'either', 'neither',
  // Prepositions and conjunctions
  'above', 'across', 'against', 'along', 'among', 'around', 'before', 'behind', 'below', 'beneath',
  'beside', 'between', 'beyond', 'during', 'except', 'inside', 'near', 'off', 'since', 'through',
  'toward', 'under', 'until', 'upon', 'within', 'without', 'although', 'though', 'unless', 'while',
  // Numbers
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'hundred', 'thousand', 'million', 'billion', 'first', 'second', 'third', 'fourth', 'fifth',
  // Days and months
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september',
  'october', 'november', 'december', 'week', 'month', 'year', 'today', 'yesterday',
  // Internet/social media terms
  'post', 'message', 'chat', 'online', 'offline', 'website', 'app', 'account', 'profile',
  'comment', 'like', 'share', 'follow', 'block', 'report', 'user', 'username', 'password',
  // Additional common words for expression
  'okay', 'ok', 'alright', 'right', 'wrong', 'true', 'false', 'real', 'fake', 'nice', 'cool',
  'awesome', 'amazing', 'wonderful', 'terrible', 'horrible', 'beautiful', 'ugly', 'pretty',
  'weird', 'strange', 'normal', 'crazy', 'funny', 'serious', 'important', 'interesting',
  'boring', 'exciting', 'perfect', 'impossible', 'possible', 'difficult', 'simple', 'complex',
  'anyone', 'everyone', 'someone', 'nobody', 'nothing', 'everything', 'something', 'anything',
  'somewhere', 'anywhere', 'nowhere', 'everywhere', 'however', 'whatever', 'whenever', 'wherever',
  'gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'dunno', 'yeah', 'yep', 'nope', 'nah', 'huh',
  'oh', 'ah', 'uh', 'um', 'hmm', 'wow', 'oops', 'ouch', 'ugh', 'yay', 'hooray', 'damn', 'darn',
  // Contractions written out
  'dont', 'cant', 'wont', 'isnt', 'arent', 'wasnt', 'werent', 'havent', 'hasnt', 'hadnt',
  'doesnt', 'didnt', 'wouldnt', 'couldnt', 'shouldnt', 'mustnt', 'neednt', 'lets', 'thats',
  'whats', 'heres', 'theres', 'wheres', 'whos', 'hows', 'whys', 'ive', 'youve', 'weve', 'theyve',
  'ill', 'youll', 'hell', 'shell', 'itll', 'well', 'theyll', 'id', 'youd', 'hed', 'shed', 'wed',
  'theyd', 'im', 'youre', 'hes', 'shes', 'its', 'were', 'theyre',
])

// Non-English word patterns (common patterns in transliterated words)
const nonEnglishPatterns = [
  // Telugu transliteration patterns
  /\b(na|naa|nenu|nee|neeku|meeku|vaadu|vaalla|amma|nanna|akka|anna|tammudu|chelli)\b/i,
  /\b(ela|enti|enduku|evaru|ekkada|eppudu|emiti|anni|inka|kani|kuda|matram|ayina)\b/i,
  /\b(chala|bagundi|ledhu|ledu|undi|unnaru|untaru|vastaru|velli|ra|raa|po|poo)\b/i,
  /\b(chesthe|chestunna|chesaru|cheyyandi|cheppandi|chudu|chudandi)\b/i,
  // Hindi transliteration patterns
  /\b(kya|kaise|kahan|kyun|kaun|kitna|kab|abhi|bahut|thoda|acha|theek|matlab)\b/i,
  /\b(haan|nahin|nahi|bilkul|zaroor|shayad|lekin|magar|aur|ya|toh|bhi|hi|jo|ki)\b/i,
  /\b(mera|meri|mere|tera|teri|tere|uska|uski|unka|unki|hamara|tumhara|apna)\b/i,
  /\b(kar|karo|karna|kiya|karega|karenge|bol|bolo|bolna|bola|bolega)\b/i,
  /\b(jao|jaa|jana|gaya|gayi|gaye|jayega|aa|aao|aana|aaya|aayi|aayega)\b/i,
  // Tamil transliteration patterns
  /\b(enna|yenna|epdi|enga|yaar|ethu|evalavu|eppadi|illai|iruku|irukku|podu|poga)\b/i,
  /\b(sollu|sollum|solla|panna|pannunga|vandhu|vandhuttu|vaanga|poonga)\b/i,
  // Kannada transliteration patterns
  /\b(nanu|nanna|neenu|ninna|avanu|avalu|ivanu|ivalu|yaaru|elli|yaake|hege)\b/i,
  /\b(illa|ide|idhe|beku|maadu|maadi|hogi|baa|baaro|baari|nodri|helri)\b/i,
  // Malayalam transliteration patterns
  /\b(njan|njaan|nee|ningal|avan|aval|enthu|enthinu|evide|eppol|engane)\b/i,
  /\b(illa|und|undu|aanu|aano|cheyyuka|poyitta|varumo|venam|venda)\b/i,
  // Bengali transliteration patterns
  /\b(ami|tumi|apni|she|ora|amra|tomra|ki|keno|kothay|kokhon|kemon)\b/i,
  /\b(haan|na|hobe|hoye|korbo|korbe|bolo|bolchi|jabo|jabe|aso|esho)\b/i,
  // Marathi transliteration patterns
  /\b(mi|tu|aapan|to|ti|kay|kasa|kuthe|kevha|kiti|honar|karaycha|sangna)\b/i,
  // Gujarati transliteration patterns
  /\b(hu|tame|te|aapne|shu|kem|kyaa|kyare|ketlu|chhe|hatu|karvu|bolvu)\b/i,
  // Punjabi transliteration patterns
  /\b(main|tu|tussi|oh|assi|ki|kivey|kithe|kado|kitna|hega|karna|bolna)\b/i,
  // Urdu transliteration patterns
  /\b(mein|aap|woh|hum|kyaa|kaise|kahan|kyun|kaun|kitna|hoga|karna|kehna)\b/i,
]

// Check if a word is likely English
function isLikelyEnglishWord(word: string): boolean {
  const lowerWord = word.toLowerCase().replace(/[^a-z]/g, '')
  if (lowerWord.length < 2) return true // Skip very short words
  
  // Check if it's in our English dictionary
  if (commonEnglishWords.has(lowerWord)) return true
  
  // Check common English word patterns/suffixes
  const englishPatterns = [
    /ing$/, /tion$/, /sion$/, /ness$/, /ment$/, /able$/, /ible$/, /ful$/,
    /less$/, /ous$/, /ive$/, /al$/, /ly$/, /er$/, /est$/, /ed$/, /es$/, /s$/,
    /^un/, /^re/, /^pre/, /^dis/, /^mis/, /^over/, /^under/
  ]
  
  for (const pattern of englishPatterns) {
    if (pattern.test(lowerWord)) {
      // Check if the root word (without suffix) is also valid
      const rootMatches = commonEnglishWords.has(lowerWord.replace(pattern, ''))
      if (rootMatches) return true
    }
  }
  
  return false
}

// Detect non-English transliterated words
function detectNonEnglishWords(text: string): string[] {
  const found: string[] = []
  const words = text.toLowerCase().split(/\s+/)
  
  // Check against non-English patterns
  for (const pattern of nonEnglishPatterns) {
    const matches = text.toLowerCase().match(pattern)
    if (matches) {
      found.push(...matches.filter(m => m.length > 1))
    }
  }
  
  // Check individual words
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/gi, '')
    if (cleanWord.length < 3) continue
    
    // Skip if it's a known English word
    if (isLikelyEnglishWord(cleanWord)) continue
    
    // Check for common non-English letter combinations
    const nonEnglishCombos = [
      /aa/, /ee/, /oo/, /uu/, /ii/, // doubled vowels common in transliteration
      /kk/, /tt/, /pp/, /dd/, /nn/, /ll/, /mm/, /rr/, /ss/, // doubled consonants
      /dh/, /th(?!e|is|at|en|em|ey|ose|ere|ough|ough)/, /bh/, /ch(?!ild|ange|eck|oose|ance|urch)/, /gh(?!t)/, /jh/, /kh/, /ph(?!one|oto|ysic)/, /sh(?!e|ow|ould|op|are|ine)/, // aspirated consonants
      /nk(?!now|now)/, /ng(?!$)/, // nasal combinations  
    ]
    
    let suspiciousCount = 0
    for (const combo of nonEnglishCombos) {
      if (combo.test(cleanWord)) {
        suspiciousCount++
      }
    }
    
    // If word has multiple suspicious patterns and is not in English dictionary
    if (suspiciousCount >= 2 && !commonEnglishWords.has(cleanWord)) {
      found.push(cleanWord)
    }
  }
  
  return [...new Set(found)]
}

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
  hasNonEnglish: boolean
  badWordsFound: string[]
  namesFound: string[]
  nonEnglishFound: string[]
}

export function validateContent(content: string): ContentValidation {
  const result: ContentValidation = {
    valid: true,
    hasBadWords: false,
    hasNames: false,
    hasNonEnglish: false,
    badWordsFound: [],
    namesFound: [],
    nonEnglishFound: [],
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
  const nonEnglishFound = detectNonEnglishWords(content)
  
  result.hasBadWords = badWordsFound.length > 0
  result.hasNames = namesFound.length > 0
  result.hasNonEnglish = nonEnglishFound.length > 0
  result.badWordsFound = badWordsFound
  result.namesFound = namesFound
  result.nonEnglishFound = nonEnglishFound

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

  if (result.hasNonEnglish) {
    return { 
      ...result, 
      valid: false, 
      error: 'Please use English words only for community accessibility' 
    }
  }
  
  return result
}

// Real-time content check
export function checkContentRealtime(content: string): {
  hasBadWords: boolean
  hasNames: boolean
  hasNonEnglish: boolean
  badWordsFound: string[]
  namesFound: string[]
  nonEnglishFound: string[]
} {
  const badWordsFound = getBadWordsInText(content)
  const namesFound = getNamesInText(content)
  const nonEnglishFound = detectNonEnglishWords(content)
  
  return {
    hasBadWords: badWordsFound.length > 0,
    hasNames: namesFound.length > 0,
    hasNonEnglish: nonEnglishFound.length > 0,
    badWordsFound,
    namesFound,
    nonEnglishFound,
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
