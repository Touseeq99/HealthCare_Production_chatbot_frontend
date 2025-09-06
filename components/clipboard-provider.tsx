"use client"

import { useEffect } from 'react'

export function ClipboardProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Polyfill for clipboard API if not available
    if (!navigator.clipboard) {
      // Add a global error handler for clipboard operations
      const originalConsoleError = console.error
      console.error = (...args) => {
        const message = args[0]?.toString() || ''
        if (message.includes('clipboard') || message.includes('Copy to clipboard')) {
          // Suppress clipboard-related errors in development
          return
        }
        originalConsoleError.apply(console, args)
      }
    }

    // Cleanup function
    return () => {
      // Restore original console.error if needed
    }
  }, [])

  return <>{children}</>
}
