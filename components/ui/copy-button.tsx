"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { useClipboard } from '@/hooks/use-clipboard'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  className?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  showText?: boolean
  disabled?: boolean
}

export function CopyButton({ 
  text, 
  className, 
  size = 'sm', 
  variant = 'ghost',
  showText = false,
  disabled = false
}: CopyButtonProps) {
  const { copy, isSupported, isCopied, error } = useClipboard()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopy = async () => {
    if (!isSupported || disabled) return
    
    setIsLoading(true)
    try {
      await copy(text)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render during SSR or if clipboard is not supported
  if (!mounted || !isSupported) {
    return null
  }

  return (
    <Button
      onClick={handleCopy}
      disabled={disabled || isLoading}
      size={size}
      variant={variant}
      className={cn(
        "transition-all duration-200",
        isCopied && "bg-green-100 text-green-700 hover:bg-green-200",
        error && "bg-red-100 text-red-700 hover:bg-red-200",
        className
      )}
      title={error || (isCopied ? "Copied!" : "Copy to clipboard")}
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : isCopied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">
          {isCopied ? "Copied!" : "Copy"}
        </span>
      )}
    </Button>
  )
}
