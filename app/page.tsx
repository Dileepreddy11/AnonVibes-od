'use client'

import { AuthProvider } from '@/components/auth-provider'
import { CommunityFeed } from '@/components/community-feed'

export default function Home() {
  return (
    <AuthProvider>
      <CommunityFeed />
    </AuthProvider>
  )
}
