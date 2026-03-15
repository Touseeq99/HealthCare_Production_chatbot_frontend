"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LoginForm } from "./login-form"
import { SignupForm } from "./signup-form"
import Image from "next/image"
import { useSearchParams } from "next/navigation"

const ROTATING_QUOTES = [
  {
    text: "MetaMedMD brings structured clinical reasoning into the digital era. It integrates evidence, guidelines, and clinical context in a way that genuinely supports how physicians think.",
    author: "Senior Cardiologist",
  },
  {
    text: "What stands out about MetaMedMD is its emphasis on transparent, evidence-based reasoning rather than black-box AI. It mirrors the analytical approach clinicians use in real-world practice.",
    author: "Senior Cardiologist",
  },
  {
    text: "MetaMedMD has the potential to become an invaluable tool for clinicians navigating increasingly complex cardiovascular care. Its structured reasoning framework reflects how expert clinicians approach decision-making.",
    author: "Senior Cardiologist",
  },
]

interface SlidingAuthProps {
    initialMode?: "signin" | "signup"
}

export function SlidingAuth({ initialMode = "signin" }: SlidingAuthProps) {
    const [isSignUp, setIsSignUp] = useState(initialMode === "signup")
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
    const searchParams = useSearchParams()

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentQuoteIndex((prev) => (prev + 1) % ROTATING_QUOTES.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        setIsSignUp(initialMode === "signup")
    }, [initialMode])

    const toggleMode = () => {
        setIsSignUp(!isSignUp)
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-white p-4 overflow-y-auto relative font-sans selection:bg-rose-100 selection:text-rose-900">
            {/* Premium Background Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[80%] bg-gradient-to-br from-rose-100/50 to-transparent rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[100%] bg-gradient-to-tr from-rose-50 to-transparent rounded-full blur-[100px]" />

                {/* Animated Floating Orbs */}
                <motion.div
                    animate={{
                        y: [0, -40, 0],
                        x: [0, 20, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/4 left-1/4 w-32 h-32 bg-rose-500/5 rounded-full blur-xl"
                />
                <motion.div
                    animate={{
                        y: [0, 60, 0],
                        x: [0, -30, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl"
                />
            </div>

            {/* Auth Container with 3D Perspective */}
            <div className="relative z-10 w-full max-w-[1100px] [perspective:2000px]">
                <motion.div
                    animate={{ rotateY: isSignUp ? 180 : 0 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="relative w-full min-h-[700px] [transform-style:preserve-3d]"
                >
                    {/* FRONT SIDE (Sign In) */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white rounded-[60px] shadow-[0_50px_100px_rgba(244,63,94,0.08)] border border-rose-100 flex overflow-hidden">
                        <div className="w-full lg:w-[55%] p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                            <div className="max-w-md mx-auto w-full">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="mb-10 flex items-center gap-4">
                                        <div className="w-14 h-14 relative bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 p-2.5">
                                            <Image src="/MetamedMDlogo (2).png" alt="Logo" fill className="object-contain p-2" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-rose-950 text-xl tracking-tight leading-none">CLARA™</h3>
                                            <p className="text-[10px] uppercase font-black text-rose-500 tracking-[0.2em] mt-1">by MetaMedMD</p>
                                        </div>
                                    </div>

                                    <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Welcome Back.</h1>
                                    <p className="text-slate-500 text-lg mb-10 font-medium">Elevate your clinical reasoning today.</p>

                                    <LoginForm />

                                    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                                        <p className="text-slate-500 font-medium">
                                            New to CLARA?{' '}
                                            <button
                                                onClick={toggleMode}
                                                className="text-rose-500 font-black hover:text-rose-600 transition-colors underline-offset-4 hover:underline"
                                            >
                                                Create account
                                            </button>
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Visual Panel Right (LIGHT THEME) */}
                        <div className="hidden lg:flex w-[45%] bg-rose-50/30 relative overflow-hidden items-center justify-center p-16 border-l border-rose-100/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-white via-rose-50/20 to-rose-100/30" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4" />

                            <div className="relative z-10 text-center">
                                <div className="w-24 h-24 bg-white rounded-[32px] border border-rose-100 flex items-center justify-center mx-auto mb-10 shadow-xl">
                                    <Image src="/MetamedMDlogo (2).png" alt="Logo" width={48} height={48} className="object-contain" />
                                </div>
                                <div className="h-[200px] flex flex-col justify-center">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={currentQuoteIndex}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.8, ease: "easeInOut" }}
                                            className="space-y-4"
                                        >
                                            <h2 className="text-2xl font-black text-rose-950 leading-tight max-w-sm mx-auto italic">
                                                "{ROTATING_QUOTES[currentQuoteIndex].text}"
                                            </h2>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                                                — {ROTATING_QUOTES[currentQuoteIndex].author}
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                                <div className="w-16 h-1 bg-rose-500/20 mx-auto rounded-full mt-8" />
                            </div>
                        </div>
                    </div>

                    {/* BACK SIDE (Sign Up) */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-[60px] shadow-[0_50px_100px_rgba(244,63,94,0.08)] border border-rose-100 flex overflow-hidden">
                        {/* Visual Panel Left (LIGHT THEME) */}
                        <div className="hidden lg:flex w-[45%] bg-rose-50/30 relative overflow-hidden items-center justify-center p-16 border-r border-rose-100/50">
                            <div className="absolute inset-0 bg-gradient-to-bl from-white via-rose-50/20 to-rose-100/30" />
                            <div className="absolute top-0 left-0 w-64 h-64 bg-rose-200/20 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />

                            <div className="relative z-10 text-center">
                                <div className="w-auto h-24 bg-white rounded-[32px] border border-rose-100 flex items-center justify-center mx-auto mb-10 shadow-xl relative px-8">
                                    <div className="text-rose-500 font-black text-2xl tracking-[0.1em]">CLARA</div>
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-rose-950 mb-8 leading-tight flex flex-col gap-3 mx-auto max-w-sm">
                                    <span>Clinical Intelligence.</span>
                                    <span className="text-rose-500">Mastered by CLARA.</span>
                                </h2>
                                <div className="w-16 h-1 bg-rose-500/20 mx-auto rounded-full" />
                            </div>
                        </div>

                        <div className="w-full lg:w-[55%] p-6 md:p-10 lg:p-12 flex flex-col items-center overflow-y-auto relative custom-scrollbar">
                            {/* Top Toggle for visibility */}
                            <div className="absolute top-10 right-14 z-20">
                                <button
                                    onClick={toggleMode}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-2"
                                >
                                    <span>Sign in</span>
                                    <div className="w-4 h-px bg-slate-200" />
                                </button>
                            </div>

                            <div className="max-w-md mx-auto w-full pt-6 pb-6">
                                <div className="mb-8 flex items-center gap-4 p-2.5 bg-rose-50/50 rounded-xl border border-rose-100/50 w-fit">
                                    <div className="w-8 h-8 relative bg-white rounded-lg flex items-center justify-center shadow-sm p-1.5">
                                        <Image src="/MetamedMDlogo (2).png" alt="Logo" fill className="object-contain p-1" />
                                    </div>
                                    <h3 className="font-black text-rose-950 text-[10px] tracking-[0.2em] leading-none uppercase pr-2">Join the Network</h3>
                                </div>

                                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Start Reasoning.</h1>
                                <p className="text-slate-200 text-sm mb-8 font-medium bg-rose-950/90 py-2.5 px-5 rounded-full w-fit">Clinical Precision. AI Speed.</p>

                                <SignupForm />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
