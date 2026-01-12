'use client';

import { Suspense } from 'react';
import { SlidingAuth } from "@/components/auth/sliding-auth";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SlidingAuth initialMode="signin" />
    </Suspense>
  );
}
