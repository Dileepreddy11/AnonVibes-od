'use client'

import { AuthProvider } from '@/components/auth-provider'
import { CommunityFeed } from '@/components/community-feed'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <AuthProvider>
      <CommunityFeed />
      <Footer />
    </AuthProvider>
  )
}
