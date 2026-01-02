"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()



  interface AuthResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: any;
  }

  const authenticateUser = async (email: string, password: string, role: string): Promise<AuthResponse> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          role: role
        }),
      });

      return await response.json();
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Authentication failed"
      };
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !role) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const result = await authenticateUser(email, password, role)

      if (result.success) {
        if (result.user) {
          localStorage.setItem("userName", result.user.name || "")
          if (result.user.surname) {
            localStorage.setItem("userSurname", result.user.surname)
            localStorage.setItem("userFullName", `${result.user.name} ${result.user.surname}`)
          }
        }

        // Success redirect
        const redirectPath = getRedirectPath(role)
        router.push(redirectPath)
      } else {
        setError(result.message || 'Invalid credentials')
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("An error occurred during login. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const getRedirectPath = (role: string) => {
    switch (role) {
      case "patient":
        return "/consent?role=patient"
      case "doctor":
        return "/consent?role=doctor"
      case "admin":
        return "/admin/dashboard"
      default:
        return "/consent"
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            I am a
          </Label>
          <Select
            value={role}
            onValueChange={setRole}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full text-slate-800 border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Select your role" className="text-slate-800" />
            </SelectTrigger>
            <SelectContent className="border-blue-200 bg-white shadow-lg">
              <SelectItem value="patient" className="text-slate-800 hover:bg-blue-700 focus:bg-blue-700">Patient</SelectItem>
              <SelectItem value="doctor" className="text-slate-800 hover:bg-blue-700 focus:bg-blue-700">Doctor</SelectItem>
              <SelectItem value="admin" className="text-slate-800 hover:bg-blue-700 focus:bg-blue-700">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </Label>
            <a href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Button
          type="submit"
          className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-75' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </div>
    </form>
  )
}
