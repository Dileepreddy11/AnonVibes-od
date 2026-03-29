'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AuthProvider } from '@/components/auth-provider'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Note: This would typically send to a backend API
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      
      // Reset the success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-4xl font-bold text-foreground mb-2">Contact Us</h1>
          <p className="text-muted-foreground mb-8">
            Have questions or feedback? We&apos;d love to hear from you.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Get in Touch</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a 
                        href="mailto:anonvibes.offical@gmail.com"
                        className="text-primary hover:underline"
                      >
                        anonvibes.offical@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg border bg-card space-y-3">
                <h3 className="font-semibold text-foreground">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  We will try to respond to your message as soon as possible. Typically, we respond within 24-48 hours.
                </p>
              </div>

              <div className="p-6 rounded-lg border bg-card space-y-3">
                <h3 className="font-semibold text-foreground">Why Contact Us?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Report bugs or technical issues
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Share feature requests
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Report inappropriate content
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    General feedback and suggestions
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitted && (
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200">
                    <p className="font-medium">Thank you for reaching out!</p>
                    <p className="text-sm">We&apos;ll get back to you as soon as possible.</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-4 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this about?"
                    required
                    className="w-full px-4 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what's on your mind..."
                    required
                    rows={5}
                    className="w-full px-4 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !formData.subject || !formData.message}
                  className="w-full gap-2"
                >
                  <Send className="h-4 w-4" />
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </AuthProvider>
  )
}
