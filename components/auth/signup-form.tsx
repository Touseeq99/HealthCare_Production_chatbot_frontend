"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

interface FormData {
  name: string
  surname: string
  phone: string
  email: string
  occupation: string
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

  const [formData, setFormData] = useState<FormData>({
    name: "",
    surname: "",
    phone: "",
    email: "",
    occupation: "",
    password: "",
    confirmPassword: "",
    role: "",
    specialization: "",
    doctorRegisterNumber: "",
    agreeToTerms: false,
  })

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "First name is required"
    if (!formData.surname.trim()) newErrors.surname = "Last name is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.role) newErrors.role = "Please select your role"
    if (formData.role !== "doctor" && !formData.occupation.trim()) newErrors.occupation = "Occupation is required"

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms"

    // Doctor-specific validation
    if (formData.role === "doctor") {
      if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required"
      if (!formData.doctorRegisterNumber.trim()) newErrors.doctorRegisterNumber = "Doctor Register Number is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    router.push("/login")
  }

  const registerUser = async (userData: FormData) => {
    try {
      // Transform the data to match the API's expected format
      const requestBody = {
        email: userData.email.trim(),
        password: userData.password,
        name: userData.name.trim(),
        surname: userData.surname.trim(),
        role: userData.role,
        phone: userData.phone.trim(),
        ...(userData.role === 'doctor' && {
          specialization: userData.specialization.trim(),
          doctor_register_number: userData.doctorRegisterNumber.trim()
        })
      };

      const startTime = performance.now();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`, {
        method: "POST",
        mode: 'cors',
        // Remove credentials: 'include' since we're not using cookies/sessions
        // credentials: 'include',
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
          const errorData = await response.clone().json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (e) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error("Registration error:", error);
      
      // If it's a network error, provide more specific feedback
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error("Cannot connect to the server. Please check if the backend is running and accessible at http://127.0.0.1:8000");
      }
      
      // For other errors, use the error message
      throw error instanceof Error ? error : new Error("Registration failed. Please try again.");
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      if (validateStep1()) {
        setStep(2)
      }
    } else {
      if (validateStep2()) {
        setIsSubmitting(true)
        try {
          const result = await registerUser(formData)

          if (!result.success) {
            setErrors({ submit: result.message || "Registration failed. Please try again." })
            return
          }

          // Store user info for demo purposes
          localStorage.setItem("userRole", formData.role)
          localStorage.setItem("userEmail", formData.email)
          localStorage.setItem("userName", `${formData.name} ${formData.surname}`)

          // Role-based routing after successful signup
          if (formData.role === "doctor") {
            router.push("/consent?role=doctor")
          } else {
            router.push("/consent?role=patient")
          }
        } catch (error) {
          console.error("Signup failed:", error)
          setErrors({ submit: "Signup failed. Please try again." })
        } finally {
          setIsSubmitting(false)
        }
      }
    }
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="text-black border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 bg-transparent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant={step === 1 ? "default" : "secondary"} className="rounded-full">
              1
            </Badge>
            <div className="w-8 h-px bg-border" />
            <Badge variant={step === 2 ? "default" : "secondary"} className="rounded-full">
              2
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold text-black">
            {step === 1 ? "Personal Information" : "Account Credentials"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {step === 1 ? "Tell us about yourself" : "Set up your account security"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errors.submit && (
            <Alert className="mb-4 border-destructive/50 text-destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-black">
                      First Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="John"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`bg-input/50 backdrop-blur-sm text-black placeholder:text-gray-500 hover:bg-blue-50 focus:bg-white ${errors.name ? "border-destructive" : ""}`}
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surname" className="text-black">
                      Last Name
                    </Label>
                    <Input
                      id="surname"
                      placeholder="Doe"
                      value={formData.surname}
                      onChange={(e) => handleInputChange("surname", e.target.value)}
                      className={`bg-input/50 backdrop-blur-sm text-black placeholder:text-gray-500 hover:bg-blue-50 focus:bg-white ${errors.surname ? "border-destructive" : ""}`}
                    />
                    {errors.surname && <p className="text-sm text-red-600">{errors.surname}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-black">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`bg-input/50 backdrop-blur-sm text-black placeholder:text-gray-500 hover:bg-blue-50 focus:bg-white ${errors.phone ? "border-destructive" : ""}`}
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`bg-input/50 backdrop-blur-sm text-black placeholder:text-gray-500 hover:bg-blue-50 focus:bg-white ${errors.email ? "border-destructive" : ""}`}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-black">
                    I am a...
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "patient" | "doctor") => handleInputChange("role", value)}
                  >
                    <SelectTrigger
                      className={`bg-input/50 backdrop-blur-sm text-black hover:bg-blue-50 ${errors.role ? "border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient" className="hover:bg-blue-50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-secondary rounded-full" />
                          <span className="text-black">Patient - Seeking medical guidance</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="doctor" className="hover:bg-blue-50">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-black">Doctor - Healthcare professional</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                </div>

                {formData.role !== "doctor" && (
                  <div className="space-y-2">
                    <Label htmlFor="occupation" className="text-black">
                      Occupation
                    </Label>
                    <Input
                      id="occupation"
                      placeholder="Your current occupation"
                      value={formData.occupation}
                      onChange={(e) => handleInputChange("occupation", e.target.value)}
                      className={`bg-input/50 backdrop-blur-sm text-black placeholder:text-gray-500 hover:bg-blue-50 focus:bg-white ${errors.occupation ? "border-destructive" : ""}`}
                    />
                    {errors.occupation && <p className="text-sm text-red-600">{errors.occupation}</p>}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-black">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`bg-input/50 backdrop-blur-sm text-black hover:bg-blue-50 focus:bg-white ${errors.password ? "border-destructive" : ""}`}
                  />
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                  <p className="text-xs text-gray-600">Must be at least 8 characters long</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-black">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`bg-input/50 backdrop-blur-sm text-black hover:bg-blue-50 focus:bg-white ${errors.confirmPassword ? "border-destructive" : ""}`}
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {formData.role === "doctor" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="text-black">
                        Medical Specialization
                      </Label>
                      <Input
                        id="specialization"
                        placeholder="Cardiology, Internal Medicine, etc."
                        value={formData.specialization}
                        onChange={(e) => handleInputChange("specialization", e.target.value)}
                        className={`bg-input/50 backdrop-blur-sm text-black placeholder:text-gray-500 hover:bg-blue-50 focus:bg-white ${errors.specialization ? "border-destructive" : ""}`}
                      />
                      {errors.specialization && <p className="text-sm text-red-600">{errors.specialization}</p>}
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="doctorRegisterNumber" className="text-black">
                        Doctor Register Number
                      </Label>
                      <Input
                        id="doctorRegisterNumber"
                        placeholder="Enter your doctor register number"
                        value={formData.doctorRegisterNumber}
                        onChange={(e) => handleInputChange("doctorRegisterNumber", e.target.value)}
                        className={`bg-input/50 backdrop-blur-sm text-black placeholder:text-gray-500 hover:bg-blue-50 focus:bg-white ${errors.doctorRegisterNumber ? "border-destructive" : ""}`}
                      />
                      {errors.doctorRegisterNumber && (
                        <p className="text-sm text-red-600">{errors.doctorRegisterNumber}</p>
                      )}
                      <p className="text-xs text-gray-600">Your official medical council registration number</p>
                    </div>
                  </>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
                  >
                    I agree to the{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.agreeToTerms && <p className="text-sm text-red-600">{errors.agreeToTerms}</p>}
              </>
            )}

            <div className="flex gap-4">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 text-black border-gray-300 hover:bg-gray-50"
                >
                  Back
                </Button>
              )}
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? "Creating Account..." : step === 1 ? "Continue" : "Create Account"}
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/login" className="text-blue-600 hover:text-blue-800 transition-colors">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
