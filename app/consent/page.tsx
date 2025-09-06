import { ConsentForm } from "@/components/onboarding/consent-form"
import { HeartbeatBackground } from "@/components/ui/heartbeat-background"
import { Suspense } from "react"

export default function ConsentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-blue-50 relative overflow-hidden">
      <HeartbeatBackground />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
          <Suspense fallback={<div>Loading...</div>}>
            <ConsentForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
