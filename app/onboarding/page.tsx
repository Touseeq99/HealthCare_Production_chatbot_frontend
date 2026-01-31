"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Stethoscope } from "lucide-react"
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
            const updateData: any = {
                role: role,
                name: name,
                surname: surname,
                updated_at: new Date().toISOString()
            }

            if (role === 'doctor') {
                updateData.specialization = specialization
                updateData.doctor_register_number = license
            }

            const { error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', userId)

            if (error) throw error

            localStorage.setItem("userName", name)
            localStorage.setItem("userSurname", surname)
            localStorage.setItem("userFullName", `${name} ${surname}`)

            if (role === 'doctor') {
                router.push('/doctor/dashboard')
            } else {
                router.push('/patient/chat')
            }
        } catch (error: any) {
            alert("We couldn't save your profile. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isVerifying) {
        return (
            <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Complete Your Profile</h1>
                        <p className="text-slate-500">To provide the best experience, we need a few more details.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700">First Name</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John"
                                    className="bg-slate-50 border-slate-200"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="surname" className="text-slate-700">Last Name</Label>
                                <Input
                                    id="surname"
                                    value={surname}
                                    onChange={(e) => setSurname(e.target.value)}
                                    placeholder="Doe"
                                    className="bg-slate-50 border-slate-200"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">I am a...</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole("patient")}
                                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${role === "patient"
                                        ? "border-teal-500 bg-teal-50 text-teal-700"
                                        : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                                        }`}
                                >
                                    <User className={`w-8 h-8 mb-2 ${role === "patient" ? "text-teal-600" : "text-slate-400"}`} />
                                    <span className="font-semibold">Patient</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("doctor")}
                                    className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${role === "doctor"
                                        ? "border-teal-500 bg-teal-50 text-teal-700"
                                        : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                                        }`}
                                >
                                    <Stethoscope className={`w-8 h-8 mb-2 ${role === "doctor" ? "text-teal-600" : "text-slate-400"}`} />
                                    <span className="font-semibold">Doctor</span>
                                </button>
                            </div>
                        </div>

                        {role === "doctor" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-4 pt-4 border-t border-slate-100"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="specialization" className="text-slate-700">Specialization</Label>
                                    <Input
                                        id="specialization"
                                        value={specialization}
                                        onChange={(e) => setSpecialization(e.target.value)}
                                        placeholder="e.g. Cardiology"
                                        className="bg-slate-50 border-slate-200"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="license" className="text-slate-700">Medical License Number</Label>
                                    <Input
                                        id="license"
                                        value={license}
                                        onChange={(e) => setLicense(e.target.value)}
                                        placeholder="e.g. MD123456"
                                        className="bg-slate-50 border-slate-200"
                                        required
                                    />
                                </div>
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading || !role || !name || !surname}
                            className="w-full bg-teal-500 hover:bg-teal-600 text-white h-12 text-lg font-bold rounded-xl shadow-lg shadow-teal-500/20"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Setup"}
                        </Button>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}
