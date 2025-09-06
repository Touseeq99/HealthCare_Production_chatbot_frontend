import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { HeartbeatBackground } from "@/components/ui/heartbeat-background"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-blue-50 relative overflow-hidden">
      <HeartbeatBackground />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-200/30 to-blue-200/30 rounded-full mb-4 animate-pulse">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-red-800 mb-2">❤️ Reset Password</h1>
            <p className="text-gray-600">We'll help you get back to your account</p>
          </div>

          <ForgotPasswordForm />

          {/* Doctor helping patient illustration placeholder */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-secondary/20 rounded-full mb-4">
              <svg className="w-16 h-16 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">Our support team is here to help</p>
          </div>
        </div>
      </div>
    </div>
  )
}
