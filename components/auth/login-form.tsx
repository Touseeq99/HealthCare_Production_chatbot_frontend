"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const checkRoleAndRedirect = async (user: any, sessionTokens: { access_token: string; refresh_token: string }) => {
    const { data: profile } = await supabase
      .from('users')
      .select('role, name, surname')
      .eq('id', user.id)
      .single()

    const dbRole = profile?.role
    const metaRole = user.user_metadata?.role
    const role = (dbRole && dbRole !== 'unassigned') ? dbRole : (metaRole || 'unassigned')

    if (role === 'unassigned') {
      router.push('/onboarding')
      return
    }

    document.cookie = `clientRole=${role}; path=/; max-age=${60 * 60 * 24 * 7}`;

    const userName = profile?.name || user.user_metadata?.name || ""
    const userSurname = profile?.surname || user.user_metadata?.surname || ""

    localStorage.setItem("userName", userName)
    if (userSurname) {
      localStorage.setItem("userSurname", userSurname)
      localStorage.setItem("userFullName", `${userName} ${userSurname}`)
    }

    if (role === 'doctor') {
      router.push('/doctor/dashboard')
    } else if (role === 'patient') {
      router.push('/patient/chat')
    } else if (role === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/consent')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Incorrect email or password. Please try again.")
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please verify your email address before logging in.")
        } else {
          setError("We couldn't log you in. Please check your details and try again.")
        }
        return
      }

      if (data.user && data.session) {
        await checkRoleAndRedirect(data.user, {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })
      }
    } catch (error) {
      setError("An error occurred during login. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) setError(error.message)
  }

  return (
    <>
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
            <Label htmlFor="email" className="block text-sm font-black text-slate-800 mb-2 tracking-tight">
              Email Address
            </Label>
            <div className="relative group">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-5 py-3.5 bg-rose-50/10 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-300 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="password" className="block text-sm font-black text-slate-800 tracking-tight">
                Password
              </Label>
              <a href="/forgot-password" university-link="" className="text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-wider">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className="relative group">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-5 py-3.5 bg-rose-50/10 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-300 transition-all text-slate-900 placeholder:text-slate-400 pr-12 font-medium"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
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
            className={`w-full flex justify-center py-5 px-4 border border-transparent rounded-2xl shadow-[0_15px_30px_rgba(244,63,94,0.15)] text-base font-black text-white bg-rose-500 hover:bg-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-500/20 transition-all duration-300 tracking-tight ${isLoading ? 'opacity-80 scale-[0.98]' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign in'
            )}
          </Button>
        </div>
      </form>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-4 text-slate-400 font-bold uppercase tracking-[0.2em]">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        className="w-full py-5 border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>Google</span>
      </Button>
    </>
  )
}
