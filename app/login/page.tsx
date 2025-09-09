import { LoginForm } from "@/components/auth/login-form"
import { HeartbeatBackground } from "@/components/ui/heartbeat-background"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-blue-100 flex flex-col justify-center items-center">
      <div className="text-center mb-8 mt-8">
        <img src="/MetamedMDlogo (2).png" alt="MetaMedMD Logo" className="h-20 w-auto mx-auto mb-2" />
        <h1 className="text-3xl font-bold text-red-500 mb-1">MetaMedMD</h1>
        <p className="text-lg text-gray-700">Smarter Care, Simpler Things</p>
      </div>
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
