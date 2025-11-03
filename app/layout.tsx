import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClipboardProvider } from '@/components/clipboard-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Footer } from '@/components/footer'
import ClientProvider from './client-provider'
import { generateStructuredData } from '@/components/seo/structured-data'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'MetaMedMD - AI-Powered Healthcare Assistant',
  description: 'MetaMedMD: Smarter Care, Simpler Things - Your AI-powered healthcare assistant for better patient care and medical insights.',
  generator: 'Next.js',
  applicationName: 'MetaMedMD',
  referrer: 'origin-when-cross-origin',
  keywords: ['healthcare', 'AI doctor', 'medical assistant', 'health tech', 'telemedicine', 'AI healthcare', 'virtual doctor'],
  authors: [{ name: 'MetaMedMD Team' }],
  creator: 'MetaMedMD',
  publisher: 'MetaMedMD',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/MetamedMDlogo (2).png',
    apple: '/MetamedMDlogo (2).png',
  },
  openGraph: {
    title: 'MetaMedMD - AI-Powered Healthcare Assistant',
    description: 'Smarter Care, Simpler Things - Your AI-powered healthcare assistant for better patient care and medical insights.',
    url: 'https://metamedmd.com',
    siteName: 'MetaMedMD',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://metamedmd.com/MetamedMDlogo.png',
        width: 1200,
        height: 630,
        alt: 'MetaMedMD Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MetaMedMD - AI-Powered Healthcare Assistant',
    description: 'Smarter Care, Simpler Things - Your AI-powered healthcare assistant',
    images: ['https://metamedmd.com/MetamedMDlogo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = generateStructuredData({
    title: 'MetaMedMD - AI-Powered Healthcare Assistant',
    description: 'Smarter Care, Simpler Things - Your AI-powered healthcare assistant for better patient care and medical insights.',
    url: 'https://metamedmd.com',
    siteName: 'MetaMedMD',
    locale: 'en_US',
    type: 'WebApplication',
  })

  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        {structuredData}
        <meta name="google-site-verification" content="YOUR_GOOGLE_SEARCH_CONSOLE_KEY" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-200"
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <ClipboardProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-grow">
                <ClientProvider>
                  <div className="animate-fade-in">
                    {children}
                  </div>
                </ClientProvider>
              </main>
              <Footer />
            </div>
            <Analytics />
            <SpeedInsights />
          </ClipboardProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
