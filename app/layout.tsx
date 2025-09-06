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
  title: 'Healthcare Chatbot',
  description: 'Healthcare Chatbot for both Patient and doctor',
  generator: 'Custom',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} flex flex-col min-h-screen`} suppressHydrationWarning={true}>
        <ErrorBoundary>
          <ClipboardProvider>
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
            <Analytics />
            <SpeedInsights />
          </ClipboardProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
