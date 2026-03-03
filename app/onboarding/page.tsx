"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

export default function OnboardingPage() {
    const router = useRouter()
    const [role, setRole] = useState<"patient" | "doctor" | "">("")
    const [name, setName] = useState("")
    const [surname, setSurname] = useState("")
    const [specialization, setSpecialization] = useState("")
    const [license, setLicense] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isVerifying, setIsVerifying] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Check if they already have a role
            const { data: profile } = await supabase
                .from('users')
                .select('role, name, surname')
                .eq('id', user.id)
                .single()

            if (profile && profile.role !== 'unassigned') {
                // Already onboarded
                if (profile.role === 'doctor') router.push('/doctor/dashboard')
                else router.push('/patient/chat')
                return
            }

            setUserId(user.id)
            if (user.user_metadata?.name) setName(user.user_metadata.name)
            if (user.user_metadata?.surname) setSurname(user.user_metadata.surname)
            else if (user.user_metadata?.full_name) {
                const names = user.user_metadata.full_name.split(' ')
                setName(names[0] || "")
                setSurname(names.slice(1).join(' ') || "")
            }

            setIsVerifying(false)
        }

        checkUser()
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!role || !userId || !name || !surname) return

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/complete-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role,
                    name,
                    surname,
                    specialization: role === 'doctor' ? specialization : undefined,
                    doctor_register_number: role === 'doctor' ? license : undefined
                })
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to save profile")
            }

            // Success! Update local storage
            localStorage.setItem("userRole", role)

            localStorage.setItem("userName", name)
            localStorage.setItem("userSurname", surname)
            localStorage.setItem("userFullName", `${name} ${surname}`)

            if (role === 'doctor') {
                router.push('/doctor/dashboard')
            } else {
                router.push('/patient/chat')
            }
        } catch (error: any) {
            console.error("Onboarding error:", error)
            alert(`We couldn't save your profile: ${error.message || "Unknown error"}. Please check your connection and try again.`)
        } finally {
            setIsLoading(false)
        }
    }

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
                {/* Subtle background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-100/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative flex flex-col items-center z-10">
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="relative mb-12"
                    >
                        <div className="absolute inset-0 bg-rose-500/10 rounded-full blur-xl animate-pulse" />
                        <Loader2 className="w-16 h-16 text-rose-500 animate-spin relative z-10" strokeWidth={1.5} />
                    </motion.div>
                    <div className="text-center space-y-3">
                        <h2 className="text-2xl font-black text-rose-950 tracking-tighter uppercase leading-none">CLARA</h2>
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] mt-4 animate-pulse">Verifying Clinical Identity</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-200/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(244,63,94,0.1)] border border-rose-100 overflow-hidden relative z-10"
            >
                <div className="p-10 md:p-14">
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-rose-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-rose-500/20 mx-auto mb-8 rotate-3">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-rose-950 mb-3 tracking-tighter uppercase">Identity <span className="text-rose-500 italic font-serif lowercase tracking-normal font-medium">Verification</span></h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Clinical Onboarding Protocol · Step 01</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-[10px] font-black text-rose-950 uppercase tracking-widest ml-1">First Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter first name"
                                    className="h-14 bg-rose-50/10 border-rose-100 focus:ring-rose-500/10 focus:border-rose-300 rounded-2xl px-5 text-sm font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="surname" className="text-[10px] font-black text-rose-950 uppercase tracking-widest ml-1">Last Name</Label>
                                <Input
                                    id="surname"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    placeholder="Enter last name"
                                    className="h-14 bg-rose-50/10 border-rose-100 focus:ring-rose-500/10 focus:border-rose-300 rounded-2xl px-5 text-sm font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black text-rose-950 uppercase tracking-widest ml-1">Credential Path</Label>
                            <div className="grid grid-cols-2 gap-5">
                                <button
                                    type="button"
                                    onClick={() => setRole("patient")}
                                    className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 ${role === "patient"
                                        ? "border-rose-500 bg-rose-50 text-rose-600 shadow-lg shadow-rose-500/10 scale-[1.02]"
                                        : "border-rose-50 bg-white text-slate-400 hover:border-rose-200 hover:bg-rose-50/30"
                                        }`}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                                        role === "patient" ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-200"
                                    )}>
                                        <User className="w-6 h-6" />
                                    </div>
                                    <span className="font-black text-xs uppercase tracking-widest">Patient</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("doctor")}
                                    className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 ${role === "doctor"
                                        ? "border-rose-500 bg-rose-50 text-rose-600 shadow-lg shadow-rose-500/10 scale-[1.02]"
                                        : "border-rose-50 bg-white text-slate-400 hover:border-rose-200 hover:bg-rose-50/30"
                                        }`}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                                        role === "doctor" ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-200"
                                    )}>
                                        <Stethoscope className="w-6 h-6" />
                                    </div>
                                    <span className="font-black text-xs uppercase tracking-widest">Clinician</span>
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {role === "doctor" && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: 10 }}
                                    animate={{ opacity: 1, height: "auto", y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: 10 }}
                                    className="space-y-5 pt-8 border-t border-rose-50"
                                >
                                    <div className="space-y-3">
                                        <Label htmlFor="specialization" className="text-[10px] font-black text-rose-950 uppercase tracking-widest ml-1">Specialization</Label>
                                        <Input
                                            id="specialization"
                                            value={specialization}
                                            onChange={(e) => setSpecialization(e.target.value)}
                                            placeholder="e.g. Cardiology"
                                            className="h-14 bg-rose-50/10 border-rose-100 focus:ring-rose-500/10 focus:border-rose-300 rounded-2xl px-5 text-sm font-medium"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="license" className="text-[10px] font-black text-rose-950 uppercase tracking-widest ml-1">Medical Registration Number</Label>
                                        <Input
                                            id="license"
                                            value={license}
                                            onChange={(e) => setLicense(e.target.value)}
                                            placeholder="e.g. MD123456"
                                            className="h-14 bg-rose-50/10 border-rose-100 focus:ring-rose-500/10 focus:border-rose-300 rounded-2xl px-5 text-sm font-medium"
                                            required
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading || !role || !name || !surname}
                                className="w-full bg-rose-500 hover:bg-rose-600 text-white h-16 text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-rose-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Profile & Continue"}
                            </Button>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center mt-6">
                                Secure clinical credentialing protocol active
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
