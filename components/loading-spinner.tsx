"use client"

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2, Heart } from 'lucide-react';

export default function LoadingSpinner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      setIsVisible(false);
    };
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white font-sans">
      {/* Soft background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-50/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative flex flex-col items-center z-10">
        <div className="relative w-16 h-16 mb-12">
          {/* Layered animations for a premium feel */}
          <div className="absolute inset-0 border-[3px] border-rose-100 rounded-full animate-[ping_3s_ease-in-out_infinite]" />
          <div className="absolute inset-0 border-[3px] border-rose-50 rounded-full animate-[spin_4s_linear_infinite]" />
          <div className="absolute inset-0 border-t-[3px] border-rose-500 rounded-full animate-[spin_1s_cubic-bezier(0.5,0.1,0.4,0.9)_infinite]" />

          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-6 h-6 text-rose-500 animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-black text-rose-950 tracking-tighter uppercase leading-none">CLARA</h2>
            <div className="w-12 h-1 bg-rose-500/10 rounded-full mt-2" />
          </div>
          <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.5em] animate-pulse">Establishing Secure Connection</p>
        </div>
      </div>

      <div className="absolute bottom-12 flex items-center gap-6 opacity-20">
        <div className="h-px w-12 bg-rose-950" />
        <div className="w-2 h-2 rounded-full bg-rose-950" />
        <div className="h-px w-12 bg-rose-950" />
      </div>
    </div>
  );
}
