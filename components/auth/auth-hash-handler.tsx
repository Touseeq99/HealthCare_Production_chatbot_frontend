"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { setCookie } from "@/lib/cookies"

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
            // 1. Rapid Role Check (Metadata is instant)
            let role = session.user.user_metadata?.role;

            if (!role || role === 'unassigned') {
                const { data } = await supabase.from('users').select('role').eq('id', session.user.id).single();
                if (data) role = data.role;
            }

            const finalRole = role || 'unassigned';

            // 2. Set Cookies via Server Side (Secure HttpOnly)
            await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_token: session.access_token,
                    refresh_token: session.refresh_token,
                    role: finalRole
                })
            });

            // 3. Store Local Info
            localStorage.setItem("userName", session.user.user_metadata?.full_name || "")
            localStorage.setItem("userRole", finalRole)

            // 4. Instant Redirect
            let targetPath = '/onboarding';
            if (finalRole === 'doctor') targetPath = '/doctor/dashboard';
            else if (finalRole === 'patient') targetPath = '/patient/chat';
            else if (finalRole === 'admin') targetPath = '/admin/dashboard'; // Keep existing admin path

            window.location.replace(targetPath);

        } catch (error) {
            isProcessing.current = false;
        }
    }

    // If we detect auth is happening, we show a loading overlay to prevent the login form flash
    if (isAuthDetected.current) {
        return (
            <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
                <div className="h-10 w-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-600 font-medium">Authenticating...</p>
            </div>
        );
    }

    return null
}
