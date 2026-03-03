'use client';

import { Suspense } from 'react';
import { SlidingAuth } from "@/components/auth/sliding-auth";
import { AuthHashHandler } from "@/components/auth/auth-hash-handler";

export default function LoginPage() {
  return (
    <>
      <AuthHashHandler />
      <Suspense fallback={
        <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
          <div className="relative flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-rose-100 border-t-rose-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em]">Igniting Engine...</p>
          </div>
        </div>
      }>
        <SlidingAuth initialMode="signin" />
      </Suspense>
    </>
  );
}
