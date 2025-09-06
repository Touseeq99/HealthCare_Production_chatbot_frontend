import { LoginForm } from "@/components/auth/login-form"
import { HeartbeatBackground } from "@/components/ui/heartbeat-background"

export default function LoginPage() {
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
            <h1 className="text-3xl font-bold text-red-800 mb-2">❤️ CardioChat</h1>
            <p className="text-gray-600">Your trusted healthcare companion</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  )
}
