import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Terms & Conditions - AnonVibes',
  description: 'Review the terms and conditions for using AnonVibes platform.',
}

export default function TermsPage() {
  return (
    <>
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
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms & Conditions</h1>

          {/* Content */}
          <div className="space-y-8 text-muted-foreground">
            <section className="space-y-4">
              <p className="text-lg font-semibold text-foreground">
                By using AnonVibes, you agree to follow these terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">User Responsibility</h2>
              <p>
                Users are responsible for the content they post. Posting harmful, abusive, illegal, or inappropriate content is strictly prohibited.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Content Moderation</h2>
              <p>
                AnonVibes reserves the right to remove any content and suspend users who violate these rules.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Platform Purpose</h2>
              <p>
                This platform is intended for sharing thoughts and emotions respectfully.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Liability</h2>
              <p>
                We are not responsible for user-generated content, but we actively moderate to maintain a safe environment.
              </p>
            </section>

            {/* Rules Section */}
            <section className="space-y-4 p-6 rounded-lg border bg-card">
              <h2 className="text-xl font-semibold text-foreground">Community Rules</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Be respectful and kind to all users</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Do not share hate speech, violence, or illegal content</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Respect everyone&apos;s anonymity and privacy</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Do not spam, advertise, or promote external links</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-semibold">•</span>
                  <span>Report any harmful or inappropriate content</span>
                </li>
              </ul>
            </section>

            {/* Contact Section */}
            <section className="space-y-4 mt-12 p-6 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold text-foreground">Questions About Our Terms?</h3>
              <p>
                If you have questions or concerns about these terms, please contact us at{' '}
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
    </>
  )
}
