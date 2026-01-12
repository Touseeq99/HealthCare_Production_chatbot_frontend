"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

interface SlidingAuthProps {
    initialMode?: "signin" | "signup"
}

export function SlidingAuth({ initialMode = "signin" }: SlidingAuthProps) {
    const [isSignUp, setIsSignUp] = useState(initialMode === "signup")
    const searchParams = useSearchParams()
    const role = searchParams.get("role")

    useEffect(() => {
        setIsSignUp(initialMode === "signup")
    }, [initialMode])

    const toggleMode = () => {
        setIsSignUp(!isSignUp)
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] p-4 overflow-hidden relative">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

            {/* Main Container - Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-[1000px] min-h-[650px] overflow-hidden flex flex-col md:flex-row z-10"
            >

                {/* Mobile Toggle (Visible only on small screens) */}
                <div className="md:hidden flex justify-center p-6 border-b border-slate-100">
                    <div className="flex bg-slate-100 rounded-full p-1 relative">
                        <motion.div
                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm"
                            animate={{ x: isSignUp ? "100%" : "0%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setIsSignUp(false)}
                            className={`relative z-10 px-8 py-2.5 text-sm font-bold transition-colors ${!isSignUp ? 'text-teal-600' : 'text-slate-500'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsSignUp(true)}
                            className={`relative z-10 px-8 py-2.5 text-sm font-bold transition-colors ${isSignUp ? 'text-teal-600' : 'text-slate-500'}`}
                        >
                            Sign Up
                        </button>
                    </div>
                </div>

                {/* Form Container (Sign In) - Left Side */}
                <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out z-0 ${isSignUp ? 'hidden md:flex md:opacity-0 md:pointer-events-none' : 'flex md:opacity-100'}`}>
                    <div className="max-w-md mx-auto w-full">
                        <div className="text-center mb-10 md:hidden">
                            <div className="relative w-16 h-16 mx-auto mb-4">
                                <Image src="/MetamedMDlogo (2).png" alt="Logo" fill className="object-contain" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-bold mb-3 text-slate-900 hidden md:block">Sign In</h2>
                            <p className="text-slate-500 mb-8 hidden md:block">Access your clinical dashboard</p>
                            <LoginForm />
                        </motion.div>
                    </div>
                </div>

                {/* Form Container (Sign Up) - Right Side */}
                <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out z-0 ${isSignUp ? 'flex md:opacity-100' : 'hidden md:flex md:opacity-0 md:pointer-events-none'}`}>
                    <div className="max-w-md mx-auto w-full">
                        <div className="text-center mb-10 md:hidden">
                            <div className="relative w-16 h-16 mx-auto mb-4">
                                <Image src="/MetamedMDlogo (2).png" alt="Logo" fill className="object-contain" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-3xl font-bold mb-3 text-slate-900 hidden md:block">Create Account</h2>
                            <p className="text-slate-500 mb-8 hidden md:block">Join the intelligent clinical network</p>
                            <SignupForm />
                        </motion.div>
                    </div>
                </div>

                {/* Overlay Container - The Slider */}
                <motion.div
                    className="hidden md:block absolute top-0 left-1/2 w-1/2 h-full z-50 overflow-hidden"
                    animate={{ x: isSignUp ? "-100%" : "0%" }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                    <motion.div
                        className="relative w-[200%] h-full flex bg-[#0F172A] text-white"
                        animate={{ x: isSignUp ? "0%" : "-50%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                        {/* Overlay Pattern */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#14B8A6_1px,transparent_1px)] [background-size:16px_16px]" />

                        {/* Overlay Panel Left (Visible when Sliding Window is on Left -> Sign In Context) */}
                        <div
                            className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center relative z-10"
                        >
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-10 border border-teal-500/20 max-w-sm shadow-2xl">
                                <div className="relative w-20 h-20 mx-auto mb-6">
                                    <Image src="/MetamedMDlogo (2).png" alt="Logo" fill className="object-contain" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4 text-white">Welcome Back!</h2>
                                <p className="text-slate-300 mb-8 leading-relaxed">
                                    "A calm, brilliant colleague — clear-thinking, evidence-driven."
                                </p>
                                <button
                                    onClick={toggleMode}
                                    className="px-10 py-3 border border-teal-500/50 text-teal-400 rounded-lg font-semibold hover:bg-teal-500/10 transition-all uppercase tracking-wider text-sm hover:scale-105"
                                >
                                    Sign In
                                </button>
                            </div>
                        </div>

                        {/* Overlay Panel Right (Visible when Sliding Window is on Right -> Sign Up Context) */}
                        <div
                            className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center relative z-10"
                        >
                            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-10 border border-teal-500/20 max-w-sm shadow-2xl">
                                <div className="relative w-20 h-20 mx-auto mb-6">
                                    <Image src="/MetamedMDlogo (2).png" alt="Logo" fill className="object-contain" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4 text-white">Join CLARA</h2>
                                <p className="text-slate-300 mb-8 leading-relaxed">
                                    Structured, evidence-based clinical reasoning for the modern clinician.
                                </p>
                                <button
                                    onClick={toggleMode}
                                    className="px-10 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-all uppercase tracking-wider text-sm shadow-lg shadow-teal-500/20 hover:scale-105"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>

                    </motion.div>
                </motion.div>

            </motion.div>
        </div>
    )
}
