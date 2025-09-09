import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ClipboardProvider } from '@/components/clipboard-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Footer } from '@/components/footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'MetaMedMD',
  description: 'MetaMedMD: Smarter Care, Simpler Things',
  generator: 'Custom',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" type="image/png" href="/MetamedMDlogo (2).png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} flex flex-col min-h-screen bg-blue-100`} suppressHydrationWarning={true}>
        <ErrorBoundary>
          <ClipboardProvider>
            <header className="w-full flex flex-col items-center mt-8 mb-4">
              <img src="/MetamedMDlogo (2).png" alt="MetaMedMD Logo" className="h-24 w-auto mx-auto" />
              <h1 className="text-3xl font-bold text-red-500 mt-4">MetaMedMD</h1>
              <p className="text-lg text-gray-700 mt-1">Smarter Care, Simpler Things</p>
            </header>
            <main className="flex-grow flex flex-col">
              {children}
            </main>
            <Footer />
            <Analytics />
            <SpeedInsights />
          </ClipboardProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
