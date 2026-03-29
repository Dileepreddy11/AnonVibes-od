'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AuthProvider } from '@/components/auth-provider'

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>

          {/* Content */}
          <div className="space-y-8 text-muted-foreground">
            <section className="space-y-4">
              <p className="text-lg font-semibold text-foreground">
                At AnonVibes, we respect your privacy.
              </p>
              <p>
                AnonVibes is an anonymous platform where users can share their thoughts and moods without revealing personal identity.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Data Collection</h2>
              <p>
                We do not collect personal information such as name, email, or phone number. However, we may store anonymous data such as posts, reactions, and comments to improve user experience.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Third-Party Services</h2>
              <p>
                We use third-party services like Firebase for database management and Google AdSense for displaying ads. These services may use cookies to provide better functionality and relevant advertisements.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Data Sharing</h2>
              <p>
                We do not sell or share user data with third parties.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Acceptance</h2>
              <p>
                By using AnonVibes, you agree to this Privacy Policy.
              </p>
            </section>

            {/* Contact Section */}
            <section className="space-y-4 mt-12 p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold text-foreground">Questions?</h3>
              <p>
                If you have concerns about our privacy practices, please contact us at{' '}
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
