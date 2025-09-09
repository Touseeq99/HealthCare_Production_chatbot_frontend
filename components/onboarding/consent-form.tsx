"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MedicalButton } from "@/components/ui/medical-button"
import { AnimatedCard } from "@/components/ui/animated-card"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import type { UserRole } from "@/lib/auth-utils"
import { getRoleDisplayName, getRoleDashboardRoute } from "@/lib/auth-utils"

export function ConsentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = (searchParams.get("role") as UserRole) || "patient"

  const [hasConsented, setHasConsented] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getConsentContent = (role: UserRole) => {
    switch (role) {
      case "patient":
        return {
          title: "Important Medical Disclaimer",
          description: "Please read and understand the following before using CardioChat",
          content: [
            "This chatbot is designed for educational and informational purposes only.",
            "The advice provided should not replace professional medical consultation.",
            "Always consult with a licensed healthcare provider for medical treatment and diagnosis.",
            "In case of medical emergencies, contact emergency services immediately.",
            "Your health information will be kept confidential and secure.",
          ],
          icon: (
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          ),
        }
      case "doctor":
        return {
          title: "Professional Usage Guidelines",
          description: "Guidelines for healthcare professionals using CardioChat",
          content: [
            "This chatbot is an assistive tool for educational and reference purposes.",
            "Always use your professional judgment and clinical expertise.",
            "Ensure patient privacy and confidentiality at all times.",
            "The tool should supplement, not replace, your medical knowledge.",
            "Report any technical issues or concerns to the support team.",
          ],
          icon: (
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          ),
        }
      default:
        return {
          title: "Terms of Use",
          description: "Please review our terms of use",
          content: ["Please review and accept our terms of use to continue."],
          icon: (
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        }
    }
  }

  const handleContinue = async () => {
    if (!hasConsented) return

    setIsSubmitting(true)
    try {
      // TODO: Save consent to backend
      console.log("User consented:", { role, timestamp: new Date().toISOString() })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Navigate to role-specific dashboard
      const dashboardRoute = getRoleDashboardRoute(role)
      router.push(dashboardRoute)
    } catch (error) {
      console.error("Failed to save consent:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const content = getConsentContent(role)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 animate-medical-pulse">
          {content.icon}
        </div>
        <h1 className="text-3xl font-bold text-black mb-2">Welcome to CardioChat</h1>
        <p className="text-gray-600">Hello {getRoleDisplayName(role)}! Let's get you started.</p>
      </div>

      {/* Consent Card */}
      <AnimatedCard medical hover>
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto animate-gentle-float">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-black">{content.title}</CardTitle>
          <CardDescription className="text-gray-600">{content.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content List */}
          <div className="space-y-4">
            {content.content.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                <p className="text-sm text-black leading-relaxed">{item}</p>
              </div>
            ))}
          </div>

          {/* Role-specific alerts */}
          {role === "patient" && (
            <Alert className="border-accent/50 bg-accent/5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <AlertDescription className="text-black">
                <strong>Emergency Notice:</strong> If you're experiencing a medical emergency, please call emergency
                services immediately. Do not use this chatbot for urgent medical situations.
              </AlertDescription>
            </Alert>
          )}

          {role === "doctor" && (
            <Alert className="border-primary/50 bg-primary/5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <AlertDescription className="text-black">
                <strong>Professional Reminder:</strong> This tool is designed to assist your practice but should never
                replace your clinical judgment and expertise.
              </AlertDescription>
            </Alert>
          )}

          {/* Consent Checkbox */}
          <div className="flex items-start space-x-3 p-4 bg-white/90 rounded-lg transition-all duration-200 hover:bg-blue-50 border border-blue-200">
            <Checkbox
              id="consent"
              checked={hasConsented}
              onCheckedChange={(checked) => setHasConsented(checked as boolean)}
              className="mt-1 border-2 border-blue-500 focus:ring-2 focus:ring-blue-400 focus:border-blue-600 bg-white"
            />
            <label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer text-black">
              I have read and understood the above information. I acknowledge that I am using this healthcare chatbot
              with full awareness of its limitations and intended purpose.
            </label>
          </div>

          {/* Action Button */}
          <MedicalButton
            onClick={handleContinue}
            disabled={!hasConsented}
            className="w-full"
            size="lg"
            medical
            isLoading={isSubmitting}
          >
            I Understand & Continue
          </MedicalButton>
        </CardContent>
      </AnimatedCard>

      {/* Additional Info */}
      <div className="text-center text-sm text-gray-600">
        <p>
          Need help? Contact our support team at{" "}
          <a
            href="mailto:support@cardiochat.com"
            className="text-primary hover:text-primary/80 transition-colors duration-200"
          >
            support@cardiochat.com
          </a>
        </p>
      </div>
    </div>
  )
}
