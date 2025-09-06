/**
 * Safe clipboard utilities that handle browser compatibility
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  try {
    // Check if clipboard API is available
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers or non-secure contexts
      return fallbackCopyToClipboard(text)
    }
  } catch (error) {
    console.warn('Clipboard API failed, trying fallback:', error)
    return fallbackCopyToClipboard(text)
  }
}

function fallbackCopyToClipboard(text: string): boolean {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    return false
  }

  try {
    // Create a temporary textarea element
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    // Execute the copy command
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    return successful
  } catch (error) {
    console.error('Fallback copy failed:', error)
    return false
  }
}

export function isClipboardSupported(): boolean {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }
  
  return !!(navigator.clipboard && window.isSecureContext) || 
         !!(document.queryCommandSupported && document.queryCommandSupported('copy'))
}
