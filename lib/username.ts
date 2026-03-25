const adjectives = [
  'Gentle', 'Kind', 'Brave', 'Calm', 'Wise', 'Warm', 'Soft', 'Quiet',
  'Hopeful', 'Peaceful', 'Serene', 'Bright', 'Noble', 'Sweet', 'Tender',
  'Caring', 'Patient', 'Humble', 'Honest', 'Loyal', 'Dreamy', 'Cosmic',
  'Mystic', 'Silent', 'Golden', 'Silver', 'Velvet', 'Crystal', 'Ember',
]

const nouns = [
  'Cloud', 'Star', 'Moon', 'Sun', 'River', 'Ocean', 'Mountain', 'Forest',
  'Meadow', 'Breeze', 'Light', 'Shadow', 'Spirit', 'Soul', 'Heart',
  'Dream', 'Hope', 'Wave', 'Rain', 'Snow', 'Leaf', 'Petal', 'Stone',
  'Phoenix', 'Sparrow', 'Dolphin', 'Butterfly', 'Owl', 'Fox', 'Wolf',
]

const STORAGE_KEY = 'anonymous_username'

export function generateUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 1000)
  return `${adjective}${noun}${number}`
}

export function getOrCreateUsername(): string {
  if (typeof window === 'undefined') {
    return generateUsername()
  }
  
  let username = localStorage.getItem(STORAGE_KEY)
  if (!username) {
    username = generateUsername()
    localStorage.setItem(STORAGE_KEY, username)
  }
  return username
}

export function clearUsername(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}
