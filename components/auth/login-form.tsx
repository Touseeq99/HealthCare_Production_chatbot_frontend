"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedCard } from "@/components/ui/animated-card"
import { MedicalButton } from "@/components/ui/medical-button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockTime, setLockTime] = useState(0)
  const router = useRouter()

  interface AuthResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: any;
  }

  const authenticateUser = async (email: string, password: string, role: string): Promise<AuthResponse> => {
    try {
      const requestBody = { 
        email: email.trim(),
        password: password,
        role: role 
      };

      const startTime = performance.now();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: "POST",
        mode: 'cors',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestBody),
      });
      const endTime = performance.now();

      if (!response.ok) {
        // Try to parse error message if possible
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (e) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      return { success: true, ...data };
    } catch (error) {
      console.error("API authentication failed:", error);
      
      // If it's a network error, provide more specific feedback
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return { 
          success: false, 
          message: "Cannot connect to the server. Please check if the backend is running and accessible at http://127.0.0.1:8000"
        };
      }
      
      // For other errors, use the error message
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Authentication failed"
      };
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

  // Check if account is locked
  useEffect(() => {
    const checkLock = () => {
      const storedLockTime = localStorage.getItem('lockTime')
      const storedAttempts = localStorage.getItem('loginAttempts')
      
      if (storedLockTime) {
        const lockTimeMs = parseInt(storedLockTime)
        const timeLeft = Math.ceil((lockTimeMs - Date.now()) / 1000)
        
        if (timeLeft > 0) {
          setIsLocked(true)
          setLockTime(timeLeft)
          const timer = setInterval(() => {
            setLockTime(prev => {
              if (prev <= 1) {
                clearInterval(timer)
                setIsLocked(false)
                localStorage.removeItem('lockTime')
                localStorage.setItem('loginAttempts', '0')
                return 0
              }
              return prev - 1
            })
          }, 1000)
          return () => clearInterval(timer)
        } else {
          localStorage.removeItem('lockTime')
          localStorage.setItem('loginAttempts', '0')
        }
      }
      
      if (storedAttempts) {
        setLoginAttempts(parseInt(storedAttempts))
      }
    }
    
    checkLock()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLocked) {
      setError(`Account temporarily locked. Please try again in ${lockTime} seconds.`)
      return
    }
    
    setIsLoading(true)
    setError("")

    try {
      const authResult = await authenticateUser(email, password, role)
      
      if (!authResult.success) {
        const attempts = loginAttempts + 1
        setLoginAttempts(attempts)
        localStorage.setItem('loginAttempts', attempts.toString())
        
        if (attempts >= 3) {
          const lockDuration = 120000 // 2 minutes in milliseconds
          const lockUntil = Date.now() + lockDuration
          localStorage.setItem('lockTime', lockUntil.toString())
          setIsLocked(true)
          setLockTime(lockDuration / 1000) // Convert to seconds for display
          setError('Too many failed attempts. Account locked for 2 minutes.')
        } else {
          setError(`${authResult.message || 'Authentication failed'} (${3 - attempts} attempts remaining)`)
        }
        return
      }
      
      // Reset attempts on successful login
      localStorage.removeItem('loginAttempts')
      localStorage.removeItem('lockTime')

      // Store authentication data
      localStorage.setItem('authToken', authResult.token || '')
      localStorage.setItem('userRole', role)
      localStorage.setItem('userEmail', email)
      localStorage.setItem('isAuthenticated', 'true')
      
      // Redirect based on role
      const redirectPath = getRedirectPath(role)
      router.push(redirectPath)
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatedCard medical hover>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>Sign in to access your healthcare dashboard</CardDescription>
      </CardHeader>
      <CardContent>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="doctor@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLocked}
              className="bg-input/50 backdrop-blur-sm transition-all duration-200 focus:bg-input/80"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLocked}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle password visibility</span>
              </Button>
            </div>
            {loginAttempts > 0 && !isLocked && (
              <p className="text-xs text-muted-foreground">
                {3 - loginAttempts} attempts remaining
              </p>
            )}
            {isLocked && (
              <p className="text-sm text-destructive">
                Try again in {Math.floor(lockTime / 60)}:{String(lockTime % 60).padStart(2, '0')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole} required>
              <SelectTrigger className="bg-input/50 backdrop-blur-sm transition-all duration-200 focus:bg-input/80">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            disabled={isLoading || isLocked}
          >
            {isLocked ? 'Account Locked' : isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="text-primary hover:text-primary/80 transition-colors duration-200">
              Forgot password?
            </Link>
            <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors duration-200">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </AnimatedCard>
  )
}
