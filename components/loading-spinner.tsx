"use client"

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function LoadingSpinner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show spinner after 100ms if still loading
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Hide spinner when route changes
    return () => {
      clearTimeout(timer);
      setIsVisible(false);
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
