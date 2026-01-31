"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface FormData {
  name: string
  surname: string
  email: string
  password: string
  confirmPassword: string
  role: "patient" | "doctor" | ""
  specialization: string
  doctorRegisterNumber: string
  agreeToTerms: boolean
}

export function SignupForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    specialization: "",
    doctorRegisterNumber: "",
    agreeToTerms: false,
  })

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (stepNumber === 1) {
      if (!formData.name) newErrors.name = "Name is required"
      if (!formData.surname) newErrors.surname = "Surname is required"
      if (!formData.email) {
        newErrors.email = "Email is required"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid"
      }
      if (!formData.role) newErrors.role = "Please select a role"
    }

    if (stepNumber === 2) {
      if (formData.role === 'doctor') {
        if (!formData.specialization) newErrors.specialization = "Specialization is required"
        if (!formData.doctorRegisterNumber) newErrors.doctorRegisterNumber = "Registration number is required"
      }
    }

    if (step === 3) {
      if (!formData.password) {
        newErrors.password = "Password is required"
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters"
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = "You must agree to the terms and conditions"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3))
    }
  }

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(3)) {
      return
    }

    setIsSubmitting(true)
    setGeneralError("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: formData.role,
            name: formData.name,
            surname: formData.surname,
            specialization: formData.specialization,
            doctor_register_number: formData.doctorRegisterNumber
          }
        }
      })

      if (error) {
        if (error.message.includes("User already registered")) {
          setGeneralError("An account with this email already exists.")
        } else {
          setGeneralError("Could not complete registration. Please try again.")
        }
        return
      }

      if (data.user && !data.session) {
        router.push('/auth/check-email')
        return
      }

      if (data.session) {
        // Set cookies via server API (Secure HttpOnly)
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            role: formData.role
          })
        });
      }

      if (data.user) {
        localStorage.setItem("userName", formData.name)
        localStorage.setItem("userSurname", formData.surname)
        localStorage.setItem("userFullName", `${formData.name} ${formData.surname}`)

        if (formData.role === 'doctor') {
          router.push('/doctor/dashboard')
        } else {
          router.push('/patient/chat')
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      setGeneralError("An unexpected error occurred. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
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
    if (error) setGeneralError(error.message)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  First Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${errors.name ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'} bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg transition-all`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600 font-medium">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="surname" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Last Name *
                </Label>
                <Input
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  className={`${errors.surname ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'} bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg transition-all`}
                />
                {errors.surname && <p className="mt-1 text-sm text-red-600 font-medium">{errors.surname}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`${errors.email ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'} bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg transition-all`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600 font-medium">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-1.5">
                I am a *
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: "patient" | "doctor") =>
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className={`${errors.role ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'} bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg`}>
                  <SelectValue placeholder="Select your role" className="text-slate-500" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-xl rounded-xl p-1">
                  <SelectItem value="patient" className="text-slate-700 focus:bg-teal-50 focus:text-teal-700 rounded-lg cursor-pointer py-2">Patient</SelectItem>
                  <SelectItem value="doctor" className="text-slate-700 focus:bg-teal-50 focus:text-teal-700 rounded-lg cursor-pointer py-2">Doctor</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="mt-1 text-sm text-red-600 font-medium">{errors.role}</p>}
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {formData.role === 'doctor' && (
              <>
                <div>
                  <Label htmlFor="specialization" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Specialization *
                  </Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={`${errors.specialization ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'} bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg transition-all`}
                  />
                  {errors.specialization && <p className="mt-1 text-sm text-red-600 font-medium">{errors.specialization}</p>}
                </div>
                <div>
                  <Label htmlFor="doctorRegisterNumber" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Medical License Number *
                  </Label>
                  <Input
                    id="doctorRegisterNumber"
                    name="doctorRegisterNumber"
                    value={formData.doctorRegisterNumber}
                    onChange={handleChange}
                    className={`${errors.doctorRegisterNumber ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'} bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg transition-all`}
                    placeholder="e.g., MD123456"
                  />
                  {errors.doctorRegisterNumber && <p className="mt-1 text-sm text-red-600 font-medium">{errors.doctorRegisterNumber}</p>}
                </div>
              </>
            )}

            <div className="pt-2">
              <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-100">
                {formData.role === 'doctor'
                  ? 'Your medical license will be verified before account activation.'
                  : 'Please proceed to set up your account security.'}
              </p>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Create Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`${errors.password ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'} bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg transition-all pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1 text-sm text-red-600 font-medium">{errors.password}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${errors.confirmPassword ? 'border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'} bg-slate-50 text-slate-900 px-4 py-2.5 rounded-lg transition-all pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>}
            </div>

            <div className="pt-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Checkbox
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, agreeToTerms: !!checked }))
                    }
                    className={`h-4 w-4 rounded ${errors.agreeToTerms ? 'border-red-500' : 'border-slate-300 text-teal-600 focus:ring-teal-500 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600'}`}

                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="font-medium text-slate-700">
                    I agree to the{' '}
                    <a href="/terms" className="text-teal-600 hover:text-teal-700 font-bold hover:underline">Terms of Service</a> and{' '}
                    <a href="/privacy" className="text-teal-600 hover:text-teal-700 font-bold hover:underline">Privacy Policy</a> *
                  </label>
                  {errors.agreeToTerms && <p className="mt-1 text-sm text-red-600 font-medium">{errors.agreeToTerms}</p>}
                </div>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {generalError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {generalError}
          </motion.div>
        )}
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative z-10 w-full">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center group cursor-default">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${step >= stepNum
                    ? 'bg-teal-500 text-white shadow-teal-500/30 scale-110'
                    : 'bg-slate-100 text-slate-400'
                    }`}
                >
                  {stepNum}
                </div>
                <span className={`mt-2 text-xs font-bold uppercase tracking-wider transition-colors ${step >= stepNum ? 'text-teal-600' : 'text-slate-400'}`}>
                  {stepNum === 1 ? 'Account' : stepNum === 2 ? 'Details' : 'Security'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="min-h-[300px]">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-slate-100 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrev}
            disabled={step === 1 || isSubmitting}
            className={`${step === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'} text-slate-500 hover:text-slate-900 hover:bg-slate-100`}
          >
            Back
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20 px-8 rounded-xl font-bold transition-all hover:scale-105"
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20 px-8 rounded-xl font-bold transition-all hover:scale-105"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          )}
        </div>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500 font-medium tracking-wider">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        className="w-full py-6 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-3"
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
