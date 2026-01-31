'use client';

import { Suspense } from 'react';
import { SlidingAuth } from "@/components/auth/sliding-auth";
import { AuthHashHandler } from "@/components/auth/auth-hash-handler";

export default function LoginPage() {
  return (
    <>
      <AuthHashHandler />
      <Suspense fallback={<div>Loading...</div>}>
        <SlidingAuth initialMode="signin" />
      </Suspense>
    </>
  );
}
