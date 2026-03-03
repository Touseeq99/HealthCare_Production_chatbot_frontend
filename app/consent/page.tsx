import { ConsentForm } from "@/components/onboarding/consent-form"
import { Suspense } from "react"

function LoadingSpinner() {
  const loadingMessages = [
    "Preparing your consent form...",
    "Loading your information...",
    "Almost there...",
    "Getting things ready..."
  ];
  const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-[40px] border border-rose-100 shadow-xl">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-rose-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-slate-600 text-center font-medium">{randomMessage}</p>
    </div>
  );
}

export default function ConsentPage() {
  return (
    <div className="min-h-screen bg-rose-50/50 flex flex-col justify-center items-center py-12 px-6">
      <div className="w-full max-w-2xl">
        <Suspense fallback={<LoadingSpinner />}>
          <ConsentForm />
        </Suspense>
      </div>
    </div>
  )
}
