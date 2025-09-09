import { ConsentForm } from "@/components/onboarding/consent-form"
import { Suspense } from "react"

export default function ConsentPage() {
  return (
    <div className="min-h-screen bg-blue-100 flex flex-col justify-center items-center">
      <div className="w-full max-w-2xl">
        <Suspense fallback={<div>Loading...</div>}>
          <ConsentForm />
        </Suspense>
      </div>
    </div>
  )
}
