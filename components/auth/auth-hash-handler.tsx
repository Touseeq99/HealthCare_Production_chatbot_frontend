"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { setCookie } from "@/lib/cookies"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Heart } from "lucide-react"
import Image from "next/image"

/**
 * This component handles OAuth redirects that use the Implicit Flow
 * (when the token is in the URL hash instead of going through the callback)
 */
export function AuthHashHandler() {
    const router = useRouter()
    const isProcessing = useRef(false)
    const isAuthDetected = useRef(typeof window !== 'undefined' && window.location.hash.includes('access_token'))

    useEffect(() => {
        // 1. Immediate Hash Check (Synchronous start)
        const checkHash = async () => {
            if (isProcessing.current) return;

            const hash = window.location.hash
            if (hash && (hash.includes('access_token') || hash.includes('refresh_token'))) {

                // Try getting session normally first (it might already be there)
                const { data: { session: existingSession } } = await supabase.auth.getSession()
                if (existingSession && !isProcessing.current) {
                    await handleSession(existingSession)
                    return
                }

                // Manual Parse Fallback (Extreme speed)
                try {
                    const params = new URLSearchParams(hash.substring(1)); // remove #
                    const access_token = params.get('access_token');
                    const refresh_token = params.get('refresh_token');

                    if (access_token && refresh_token) {
                        const { data: { session }, error } = await supabase.auth.setSession({
                            access_token,
                            refresh_token
                        });
                        if (!error && session) await handleSession(session);
                    }
                } catch (err) {
                    // Manual recovery failed
                }
            }
        }

        checkHash()

        // 2. Auth State Listener (Backup)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Do NOT process anything on SIGNED_OUT — the logout handler handles the redirect
            if (event === 'SIGNED_OUT') return;
            if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session && !isProcessing.current) {
                await handleSession(session)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [router])

    const handleSession = async (session: any) => {
        if (isProcessing.current) return;
        isProcessing.current = true;

        try {
            // NOTE: With flowType: 'pkce' set on the Supabase client, this handler
            // should never fire for normal OAuth flows — the server-side callback
            // route handles everything. This is kept only as a last-resort fallback.

            // Role priority: DB first → user_metadata fallback → 'unassigned'
            let role = 'unassigned';
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();

            if (profile?.role && profile.role !== 'unassigned') {
                role = profile.role
            } else {
                const metaRole = session.user.user_metadata?.role
                if (metaRole && metaRole !== 'unassigned') role = metaRole
            }

            // Set cookies clientRole so the UI knows
            document.cookie = `clientRole=${role}; path=/; max-age=${60 * 60 * 24 * 7}`;;

            localStorage.setItem("userName", session.user.user_metadata?.full_name || "")

            // Determine destination
            let destination = '/onboarding';
            if (role === 'doctor') destination = '/doctor/dashboard';
            else if (role === 'patient') destination = '/patient/chat';
            else if (role === 'admin') destination = '/admin/dashboard';

            // New users must go through disclaimer (same as server-side callback)
            const isNewUser = session.user.created_at === session.user.last_sign_in_at;
            const target = isNewUser
                ? `/disclaimer?redirect=${encodeURIComponent(destination)}`
                : destination;

            window.location.replace(target);

        } catch (error) {
            isProcessing.current = false;
        }
    }

    // If we detect auth is happening, we show a loading overlay to prevent the login form flash
    if (isAuthDetected.current) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center font-sans"
                >
                    {/* Subtle background elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-100/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                    </div>

                    <div className="relative flex flex-col items-center z-10">
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                                opacity: [0.8, 1, 0.8],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="relative mb-12"
                        >
                            <div className="relative w-16 h-16 transition-transform hover:scale-110">
                                <Image
                                    src="/MetamedMDlogo (2).png"
                                    alt="MetaMedMD Logo"
                                    width={64}
                                    height={64}
                                    className="object-contain"
                                    priority
                                />
                                <div className="absolute -inset-4 border border-rose-100 rounded-full animate-[spin_4s_linear_infinite]" />
                                <div className="absolute -inset-8 border border-rose-50 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
                            </div>
                        </motion.div>

                        <div className="text-center space-y-3">
                            <h2 className="text-2xl font-black text-rose-950 tracking-tighter uppercase leading-none">CLARA</h2>
                            <div className="flex items-center gap-2 justify-center">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:-0.3s]" />
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-bounce [animation-delay:-0.15s]" />
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-bounce" />
                            </div>
                            <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] mt-4">Establishing Secure Node</p>
                        </div>
                    </div>

                    <div className="absolute bottom-12 text-center">
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Clinical Data Sync In Progress</p>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    return null
}
