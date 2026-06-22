import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'AnonVibes - Anonymous Mood Community',
  description: 'Express yourself freely and anonymously. Join a supportive community where you can share your thoughts and emotions without judgment.',
  keywords: ['anonymous', 'mood', 'community', 'mental health', 'support', 'share thoughts', 'emotions'],
  authors: [{ name: 'Dileep Reddy Sunkireddy' }],
  creator: 'Dileep Reddy Sunkireddy',
  publisher: 'AnonVibes',
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://anonvibes.vercel.app',
    title: 'AnonVibes - Anonymous Mood Community',
    description: 'Express yourself freely and anonymously. Join a supportive community where you can share your thoughts and emotions without judgment.',
    images: [
      {
        url: 'https://anonvibes.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AnonVibes - Anonymous Mood Community',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnonVibes - Anonymous Mood Community',
    description: 'Express yourself freely and anonymously. Join a supportive community where you can share your thoughts and emotions without judgment.',
    images: ['https://anonvibes.vercel.app/twitter-image.png'],
    creator: '@anonvibes',
  },
  manifest: '/manifest.json',
  canonical: 'https://anonvibes.vercel.app',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AnonVibes",
  "description": "An anonymous social platform where users can express their thoughts, feelings, and emotions freely without revealing their identity.",
  "url": "https://anonvibes.vercel.app",
  "applicationCategory": "SocialNetworking",
  "creator": {
    "@type": "Person",
    "name": "Dileep Reddy Sunkireddy"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
