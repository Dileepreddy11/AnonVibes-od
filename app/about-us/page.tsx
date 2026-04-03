'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArrowLeft, Heart } from 'lucide-react'
import Link from 'next/link'
import { AuthProvider } from '@/components/auth-provider'

export default function AboutUsPage() {
  return (
    <AuthProvider>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12">
          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Page Title */}
          <h1 className="text-4xl font-bold text-foreground mb-8">About Us</h1>

          {/* Content */}
          <div className="space-y-8 text-muted-foreground">
            {/* Main Introduction */}
            <section className="space-y-4">
              <p className="text-lg font-semibold text-foreground flex items-start gap-2">
                <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-1" fill="currentColor" />
                AnonVibes: Your Safe Space to Share Freely
              </p>
              <p className="leading-relaxed">
                AnonVibes is an anonymous mood-sharing platform where users can express their thoughts, feelings, and emotions freely without revealing their identity.
              </p>
            </section>

            {/* Our Mission */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Our Mission</h2>
              <p className="leading-relaxed">
                We believe everyone deserves a safe space to share what they feel — without judgment, names, or pressure. At AnonVibes, your voice matters, and your emotions are valid.
              </p>
            </section>

            {/* What You Can Do */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">What You Can Do Here</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold mt-1">💭</span>
                  <span><strong>Share your mood anonymously</strong> - Express yourself without the fear of judgment or exposure</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold mt-1">👁️</span>
                  <span><strong>Read what others are feeling</strong> - Connect through genuine, heartfelt posts from the community</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold mt-1">🤝</span>
                  <span><strong>Connect through real emotions, not identities</strong> - Build meaningful connections based on feelings and experiences, not appearances or names</span>
                </li>
              </ul>
            </section>

            {/* Our Values */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Our Core Values</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">Privacy First</h3>
                  <p className="text-sm text-muted-foreground">
                    Your anonymity is sacred. We never collect personal identifiers, and all posts are completely anonymous.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">Safe Community</h3>
                  <p className="text-sm text-muted-foreground">
                    We maintain a respectful space through community guidelines and content moderation to ensure everyone feels secure.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">Authentic Connection</h3>
                  <p className="text-sm text-muted-foreground">
                    Real emotions create real connections. We focus on genuine expression over perfection and appearance.
                  </p>
                </div>
                <div className="p-4 rounded-lg border bg-card">
                  <h3 className="font-semibold text-foreground mb-2">No Judgment</h3>
                  <p className="text-sm text-muted-foreground">
                    Every feeling is valid. Our community is built on empathy, understanding, and mutual respect.
                  </p>
                </div>
              </div>
            </section>

            {/* Our Goal */}
            <section className="space-y-4 p-6 rounded-lg border bg-primary/5">
              <h2 className="text-xl font-semibold text-foreground">Our Goal</h2>
              <p className="leading-relaxed">
                We aim to build a simple and safe community where honesty comes first. AnonVibes is more than just a platform — it's a movement toward a world where people can be their authentic selves, express their true feelings, and find support without fear.
              </p>
              <p className="text-lg font-semibold text-primary">
                No names. Just vibes. 💭
              </p>
            </section>

            {/* Contact Section */}
            <section className="space-y-4 mt-12 p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold text-foreground">Have Questions?</h3>
              <p>
                We&apos;d love to hear from you! If you have any questions or feedback about AnonVibes, feel free to reach out to us at{' '}
                <a 
                  href="mailto:anonvibes.offical@gmail.com"
                  className="text-primary hover:underline font-medium"
                >
                  anonvibes.offical@gmail.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </AuthProvider>
  )
}
