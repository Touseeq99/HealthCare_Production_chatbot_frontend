"use client"
import React, { useEffect, useState } from 'react';

export default function LoadingSpinner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleStart = () => setShow(true);
    const handleStop = () => setShow(false);

    window.addEventListener('routeChangeStart', handleStart);
    window.addEventListener('routeChangeComplete', handleStop);
    window.addEventListener('routeChangeError', handleStop);

    return () => {
      window.removeEventListener('routeChangeStart', handleStart);
      window.removeEventListener('routeChangeComplete', handleStop);
      window.removeEventListener('routeChangeError', handleStop);
    };
  }, []);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-100/80 backdrop-blur-sm">
      <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );
}
