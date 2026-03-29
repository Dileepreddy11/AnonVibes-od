'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background py-8 mt-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-4 w-4 text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-semibold">AnonVibes</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your safe space to share thoughts and emotions anonymously.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Community</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Report Content
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Get in Touch</h4>
            <p className="text-sm text-muted-foreground">
              Have questions or feedback?
            </p>
            <a 
              href="mailto:anonvibes.offical@gmail.com"
              className="text-sm text-primary hover:underline transition-colors"
            >
              anonvibes.offical@gmail.com
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-sm text-muted-foreground">
            <p>© 2024 AnonVibes. All rights reserved.</p>
            <p>Made with <Heart className="h-3 w-3 inline text-primary" fill="currentColor" /> for mental wellness</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
