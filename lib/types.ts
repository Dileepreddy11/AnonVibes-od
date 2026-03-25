import type { Timestamp } from 'firebase/firestore'

export type Mood = 'happy' | 'sad' | 'angry' | 'stressed' | 'confused'

export type ReactionType = 'support' | 'relate' | 'staystrong'

export interface Post {
  id: string
  content: string
  mood: Mood
  authorId: string
  authorName: string
  createdAt: Timestamp
  reactionCounts: {
    support: number
    relate: number
    staystrong: number
  }
  commentCount: number
  reported: boolean
}

export interface Comment {
  id: string
  postId: string
  content: string
  authorId: string
  authorName: string
  createdAt: Timestamp
}

export interface Reaction {
  id: string
  postId: string
  userId: string
  type: ReactionType
  createdAt: Timestamp
}

export interface MoodStats {
  mood: Mood
  count: number
  percentage: number
}

export const MOODS: { value: Mood; label: string; emoji: string; color: string; bgColor: string }[] = [
  { value: 'happy', label: 'Happy', emoji: '😊', color: 'text-mood-happy', bgColor: 'bg-mood-happy-bg' },
  { value: 'sad', label: 'Sad', emoji: '😢', color: 'text-mood-sad', bgColor: 'bg-mood-sad-bg' },
  { value: 'angry', label: 'Angry', emoji: '😠', color: 'text-mood-angry', bgColor: 'bg-mood-angry-bg' },
  { value: 'stressed', label: 'Stressed', emoji: '😰', color: 'text-mood-stressed', bgColor: 'bg-mood-stressed-bg' },
  { value: 'confused', label: 'Confused', emoji: '😕', color: 'text-mood-confused', bgColor: 'bg-mood-confused-bg' },
]

export const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'support', emoji: '❤️', label: 'Support' },
  { type: 'relate', emoji: '🤝', label: 'Relate' },
  { type: 'staystrong', emoji: '🔥', label: 'Stay Strong' },
]
