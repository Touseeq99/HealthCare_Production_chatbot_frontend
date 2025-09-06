import { useState, useCallback, useEffect } from 'react'
import { copyToClipboard, isClipboardSupported } from '@/lib/clipboard-utils'

interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>
  isSupported: boolean
  isCopied: boolean
  error: string | null
}

export function useClipboard(): UseClipboardReturn {
  const [isCopied, setIsCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(false)

  // Check clipboard support only on client side
  useEffect(() => {
    setSupported(isClipboardSupported())
  }, [])

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      setError(null)
      const success = await copyToClipboard(text)
      
      if (success) {
        setIsCopied(true)
        // Reset the copied state after 2 seconds
        setTimeout(() => setIsCopied(false), 2000)
        return true
      } else {
        setError('Failed to copy to clipboard')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return false
    }
  }, [])

  return {
    copy,
    isSupported: supported,
    isCopied,
    error
  }
}
