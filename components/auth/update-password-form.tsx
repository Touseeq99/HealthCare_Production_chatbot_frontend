"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Lock, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export function UpdatePasswordForm() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()

    const checkRoleAndRedirect = async (userId: string) => {
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single()

        if (!profile) {
            router.push('/login')
            return
        }

        if (profile.role === 'doctor') {
            router.push('/doctor/dashboard')
        } else if (profile.role === 'patient') {
            router.push('/patient/chat')
        } else if (profile.role === 'admin') {
            router.push('/admin/dashboard')
        } else {
            router.push('/consent')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        setIsLoading(true)

        try {
            const { data, error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                setError(error.message)
            } else {
                toast.success("Password updated successfully!")
                if (data.user) {
                    await checkRoleAndRedirect(data.user.id)
                } else {
                    router.push('/login')
                }
            }
        } catch (err) {
            console.error("Update password error:", err)
            setError("An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700"
        >
            <div className="text-center mb-8">
                <div className="mx-auto w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-4 transform rotate-3">
                    <Lock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Update Password</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Please enter your new password below.
                </p>
            </div>

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

                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pr-10 bg-slate-50 border-slate-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="pr-10 bg-slate-50 border-slate-200"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                        >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white h-11 text-lg font-bold rounded-xl shadow-lg shadow-teal-500/20"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        'Update Password'
                    )}
                </Button>
            </form>
        </motion.div>
    )
}
