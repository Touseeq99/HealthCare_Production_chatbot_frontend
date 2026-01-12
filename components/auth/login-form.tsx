"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
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
    isNetworkError?: boolean;
    isServerError?: boolean;
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

      if (response.status >= 500) {
        return { success: false, message: "Server is experiencing issues. Please try again later.", isServerError: true };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Authentication error:", error);
      const isNetwork = error instanceof TypeError && error.message === "Failed to fetch";
      return {
        success: false,
        message: isNetwork
          ? "Unable to connect to server. Please check your internet connection and try again."
          : "An unexpected error occurred.",
        isNetworkError: isNetwork
      };
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 1. Missing Required Fields
    if (!email || !password || !role) {
      setError("Please fill in all fields")
      return
    }

    // 2. Invalid Role Value
    if (!["patient", "doctor", "admin"].includes(role)) {
      setError("Invalid role selected. Please refresh and try again.")
      return
    }

    // 3. Invalid Email Format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    // Password Length Check (1-128 characters)
    if (password.length < 1 || password.length > 128) {
      setError("Password must be between 1 and 128 characters.")
      return
    }

    setIsLoading(true)

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

        const redirectPath = getRedirectPath(role)
        router.push(redirectPath)
      } else {
        setError(result.message || 'Invalid email or password')
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
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {error}
        </motion.div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Email Address
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900 placeholder:text-slate-400"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-1.5">
            I am a
          </Label>
          <Select
            value={role}
            onValueChange={setRole}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900">
              <SelectValue placeholder="Select your role" className="text-slate-500" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white shadow-xl rounded-xl p-1">
              <SelectItem value="patient" className="text-slate-700 focus:bg-teal-50 focus:text-teal-700 rounded-lg cursor-pointer py-2">Patient</SelectItem>
              <SelectItem value="doctor" className="text-slate-700 focus:bg-teal-50 focus:text-teal-700 rounded-lg cursor-pointer py-2">Doctor</SelectItem>
              <SelectItem value="admin" className="text-slate-700 focus:bg-teal-50 focus:text-teal-700 rounded-lg cursor-pointer py-2">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password
            </Label>
            <a href="/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-500 transition-colors">
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
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-900 placeholder:text-slate-400 pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
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
          className={`w-full flex justify-center py-6 px-4 border border-transparent rounded-xl shadow-lg shadow-teal-500/20 text-sm font-bold text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 ${isLoading ? 'opacity-80 scale-[0.98]' : 'hover:scale-[1.02]'}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            'Sign in'
          )}
        </Button>
      </div>
    </form>
  )
}
