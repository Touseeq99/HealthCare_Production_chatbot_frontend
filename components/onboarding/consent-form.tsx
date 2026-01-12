"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { UserRole } from "@/lib/auth-utils"
import { getRoleDisplayName, getRoleDashboardRoute } from "@/lib/auth-utils"
import { Check, AlertTriangle, Shield, Stethoscope, FileText, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
          icon: <Shield className="w-8 h-8 text-teal-400" />,
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
          icon: <Stethoscope className="w-8 h-8 text-teal-400" />,
        }
      default:
        return {
          title: "Terms of Use",
          description: "Please review our terms of use",
          content: ["Please review and accept our terms of use to continue."],
          icon: <FileText className="w-8 h-8 text-teal-400" />,
        }
    }
  }

  const handleContinue = async () => {
    if (!hasConsented) return

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

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
    <div className="space-y-8 w-full max-w-2xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-2xl mb-2 shadow-xl border border-slate-700 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-teal-500/10 group-hover:bg-teal-500/20 transition-colors" />
          {content.icon}
        </motion.div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome to CLARA</h1>
          <p className="text-slate-400">Hello {getRoleDisplayName(role)}! Let's get you set up.</p>
        </div>
      </div>

      {/* Consent Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
      >
        <CardHeader className="text-center border-b border-slate-800 bg-slate-900/50 pb-8 pt-8">
          <CardTitle className="text-2xl font-bold text-white mb-2">{content.title}</CardTitle>
          <CardDescription className="text-slate-400 text-base">{content.description}</CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Content List */}
          <div className="space-y-4">
            {content.content.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-teal-500/30 transition-all group"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/10 flex items-center justify-center mt-0.5 group-hover:bg-teal-500/20 transition-colors">
                  <Check className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed group-hover:text-slate-200">{item}</p>
              </motion.div>
            ))}
          </div>

          {/* Role-specific alerts */}
          {role === "patient" && (
            <Alert className="border-red-900/50 bg-red-950/20">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <AlertDescription className="text-red-200 ml-2">
                <strong className="text-red-400 block mb-1">Emergency Notice</strong>
                If you're experiencing a medical emergency, please call emergency services immediately. Do not use this chatbot for urgent situations.
              </AlertDescription>
            </Alert>
          )}

          {role === "doctor" && (
            <Alert className="border-teal-900/50 bg-teal-950/20">
              <Shield className="h-5 w-5 text-teal-400" />
              <AlertDescription className="text-teal-100 ml-2">
                <strong className="text-teal-400 block mb-1">Professional Reminder</strong>
                This tool is designed to assist your practice but should never replace your clinical judgment and expertise.
              </AlertDescription>
            </Alert>
          )}

          {/* Consent Checkbox */}
          <div className="pt-4 border-t border-slate-800">
            <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-xl hover:bg-slate-800/50 transition-colors">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 appearance-none rounded border border-slate-600 bg-slate-800 checked:bg-teal-500 checked:border-teal-500 transition-all cursor-pointer"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                />
                <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors select-none">
                I acknowledge that I have read, understood, and agree to the terms and conditions outlined above.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleContinue}
            disabled={!hasConsented || isSubmitting}
            className={cn(
              "w-full h-12 text-base font-medium transition-all duration-300",
              hasConsented && !isSubmitting
                ? "bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/20"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Agree & Continue <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </CardContent>
      </motion.div>
    </div>
  )
}
