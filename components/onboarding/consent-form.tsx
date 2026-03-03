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
          description: "Please read and understand the following before using CLARA™",
          content: [
            "This chatbot is designed for educational and informational purposes only.",
            "The advice provided should not replace professional medical consultation.",
            "Always consult with a licensed healthcare provider for medical treatment and diagnosis.",
            "In case of medical emergencies, contact emergency services immediately.",
            "Your health information will be kept confidential and secure.",
          ],
          icon: <Shield className="w-8 h-8 text-rose-400" />,
        }
      case "doctor":
        return {
          title: "Professional Usage Guidelines",
          description: "Guidelines for healthcare professionals using CLARA™",
          content: [
            "This chatbot is an assistive tool for educational and reference purposes.",
            "Always use your professional judgment and clinical expertise.",
            "Ensure patient privacy and confidentiality at all times.",
            "The tool should supplement, not replace, your medical knowledge.",
            "Report any technical issues or concerns to the support team.",
          ],
          icon: <Stethoscope className="w-8 h-8 text-rose-400" />,
        }
      default:
        return {
          title: "Terms of Use",
          description: "Please review our terms of use",
          content: ["Please review and accept our terms of use to continue."],
          icon: <FileText className="w-8 h-8 text-rose-400" />,
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
    <div className="space-y-12 w-full max-w-2xl mx-auto">
      {/* Welcome Header */}
      <div className="text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-[#1A0A0E] rounded-[32px] mb-2 shadow-2xl border border-rose-500/20 relative overflow-hidden group mx-auto"
        >
          <div className="absolute inset-0 bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors" />
          {content.icon}
        </motion.div>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Welcome to CLARA™</h1>
          <p className="text-slate-500 font-medium">Hello {getRoleDisplayName(role)}! Let's get you set up.</p>
        </div>
      </div>

      {/* Consent Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#1A0A0E] border border-rose-500/10 rounded-[60px] overflow-hidden shadow-[0_40px_100px_rgba(244,63,94,0.15)] relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

        <CardHeader className="text-center border-b border-white/5 bg-white/5 pb-10 pt-12 relative z-10">
          <CardTitle className="text-3xl font-extrabold text-white mb-3 tracking-tight">{content.title}</CardTitle>
          <CardDescription className="text-slate-400 text-lg font-medium">{content.description}</CardDescription>
        </CardHeader>

        <CardContent className="p-10 md:p-12 space-y-10 relative z-10">
          {/* Content List */}
          <div className="space-y-5">
            {content.content.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="flex items-start gap-5 p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-rose-500/20 transition-all group"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-rose-500/10 flex items-center justify-center mt-0.5 group-hover:bg-rose-500 group-hover:rotate-12 transition-all duration-300">
                  <Check className="w-4 h-4 text-rose-400 group-hover:text-white" />
                </div>
                <p className="text-base text-slate-300 leading-relaxed font-medium group-hover:text-white transition-colors">{item}</p>
              </motion.div>
            ))}
          </div>

          {/* Role-specific alerts */}
          {role === "patient" && (
            <Alert className="border-rose-900/50 bg-rose-950/20 rounded-3xl p-6">
              <AlertTriangle className="h-6 w-6 text-rose-400" />
              <AlertDescription className="text-rose-200 ml-3">
                <strong className="text-rose-400 block mb-1 text-lg font-extrabold">Emergency Notice</strong>
                If you're experiencing a medical emergency, please call emergency services immediately. Do not use this chatbot for urgent situations.
              </AlertDescription>
            </Alert>
          )}

          {role === "doctor" && (
            <Alert className="border-rose-500/20 bg-rose-500/10 rounded-3xl p-6">
              <Shield className="h-6 w-6 text-rose-400" />
              <AlertDescription className="text-rose-100 ml-3">
                <strong className="text-rose-400 block mb-1 text-lg font-extrabold">Professional Reminder</strong>
                This tool is designed to assist your practice but should never replace your clinical judgment and expertise.
              </AlertDescription>
            </Alert>
          )}

          {/* Consent Checkbox */}
          <div className="pt-6 border-t border-white/5">
            <label className="flex items-start gap-5 cursor-pointer group p-5 rounded-3xl hover:bg-white/5 transition-all">
              <div className="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  className="peer h-6 w-6 appearance-none rounded-lg border border-white/10 bg-white/5 checked:bg-rose-500 checked:border-rose-500 transition-all cursor-pointer"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                />
                <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <span className="text-base text-slate-400 group-hover:text-slate-200 transition-colors select-none font-medium">
                I acknowledge that I have read, understood, and agree to the terms and conditions outlined above.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleContinue}
            disabled={!hasConsented || isSubmitting}
            className={cn(
              "w-full h-16 text-lg font-extrabold rounded-full transition-all duration-500 ease-out",
              hasConsented && !isSubmitting
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-[0_20px_40px_rgba(244,63,94,0.3)] hover:scale-[1.02]"
                : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                Agree & Continue <ArrowRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </CardContent>
      </motion.div>
    </div>
  )
}
