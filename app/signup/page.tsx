'use client';

import { Suspense } from 'react';
import { SlidingAuth } from "@/components/auth/sliding-auth";

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SlidingAuth initialMode="signup" />
    </Suspense>
  );
}
