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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Store non-sensitive info in localStorage (optional, similar to login)
        localStorage.setItem("userName", formData.name)

        // Redirect based on role after successful signup
        if (formData.role === 'doctor') {
          router.push('/doctor/dashboard')
        } else {
          router.push('/patient/chat')
        }
      } else {
        setGeneralError(result.message || "Registration failed. Please try again.")
      }
    } catch (error) {
      console.error('Signup error:', error)
      setGeneralError("An unexpected error occurred. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
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
                <Label htmlFor="name" className="block text-sm font-medium text-slate-800 mb-1">
                  First Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${errors.name ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'} text-slate-800`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="surname" className="block text-sm font-medium text-slate-800 mb-1">
                  Last Name *
                </Label>
                <Input
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  className={`${errors.surname ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'} text-slate-800`}
                />
                {errors.surname && <p className="mt-1 text-sm text-red-600">{errors.surname}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-slate-800 mb-1">
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`${errors.email ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'} text-slate-800`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="role" className="block text-sm font-medium text-slate-800 mb-1">
                I am a *
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: "patient" | "doctor") =>
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger className={`${errors.role ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'} text-slate-800`}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
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
                  <Label htmlFor="specialization" className="block text-sm font-medium text-slate-800 mb-1">
                    Specialization *
                  </Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={`${errors.specialization ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'} text-slate-800`}
                  />
                  {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>}
                </div>
                <div>
                  <Label htmlFor="doctorRegisterNumber" className="block text-sm font-medium text-slate-800 mb-1">
                    Medical License Number *
                  </Label>
                  <Input
                    id="doctorRegisterNumber"
                    name="doctorRegisterNumber"
                    value={formData.doctorRegisterNumber}
                    onChange={handleChange}
                    className={`${errors.doctorRegisterNumber ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'} text-slate-800`}
                    placeholder="e.g., MD123456"
                  />
                  {errors.doctorRegisterNumber && <p className="mt-1 text-sm text-red-600">{errors.doctorRegisterNumber}</p>}
                </div>
              </>
            )}

            <div className="pt-2">
              <p className="text-sm text-gray-500">
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
              <Label htmlFor="password" className="block text-sm font-medium text-slate-800 mb-1">
                Create Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`${errors.password ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'} text-slate-800 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
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
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-800 mb-1">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'} text-slate-800 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
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
                    className={`h-4 w-4 rounded ${errors.agreeToTerms ? 'border-red-500' : 'border-gray-300 text-blue-600 focus:ring-blue-500'}`}

                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="font-medium text-slate-800">
                    I agree to the{' '}
                    <a href="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</a> and{' '}
                    <a href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</a> *
                  </label>
                  {errors.agreeToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>}
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4"
        >
          {generalError}
        </motion.div>
      )}
      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNum
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                  }`}
              >
                {stepNum}
              </div>
              <span className="mt-1 text-xs text-gray-600">
                {stepNum === 1 ? 'Account' : stepNum === 2 ? 'Details' : 'Security'}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute top-0 left-0 h-0.5 bg-gray-200 w-full -z-10"></div>
          <div
            className="absolute top-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 -z-5"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      {renderStep()}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={step === 1 || isSubmitting}
          className={`${step === 1 ? 'hidden' : 'flex items-center'} text-blue-600 border-blue-300 hover:bg-blue-400 hover:text-black`}

        >
          Back
        </Button>

        {step < 3 ? (
          <Button
            type="button"
            onClick={handleNext}
            className="ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Continue
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        )}
      </div>
    </form>
  )
}
