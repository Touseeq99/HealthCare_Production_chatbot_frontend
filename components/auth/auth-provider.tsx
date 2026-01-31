"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Helper to read cookie by name (Keeping it for now if needed, though Supabase might not need it)
const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
};

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
const CHECK_INTERVAL_MS = 30 * 1000; // 30 seconds

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [lastActivity, setLastActivity] = useState(Date.now());

    const handleLogout = useCallback(async () => {
        try {
            await supabase.auth.signOut();
        } catch (e) {
            console.error("Logout failed", e);
        } finally {
            // Clear all client-side storage
            localStorage.clear();
            sessionStorage.clear();

            // Clear cookies server-side (Secure HttpOnly)
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
            } catch (e) {
                console.error("Server-side logout failed", e);
            }

            // Broadcast logout to other tabs
            try {
                localStorage.setItem("auth_logout", Date.now().toString());
            } catch (e) {
                // Ignore if localStorage is cleared
            }

            // Force immediate redirect without history
            window.location.replace("/login");
        }
    }, []);

    const checkToken = useCallback(async () => {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
            // If we are on a protected route and have no session, log out
            const protectedRoutes = ['/doctor', '/admin', '/patient'];
            const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

            if (isProtectedRoute) {
                console.log("No Supabase session on protected route, logging out");
                handleLogout();
            }
        }
    }, [handleLogout, pathname]);

    // Activity Monitor
    useEffect(() => {
        const updateActivity = () => setLastActivity(Date.now());

        window.addEventListener("mousemove", updateActivity);
        window.addEventListener("keydown", updateActivity);
        window.addEventListener("click", updateActivity);
        window.addEventListener("scroll", updateActivity);

        // Initial token check
        checkToken();

        const interval = setInterval(async () => {
            // Check inactivity
            if (Date.now() - lastActivity > INACTIVITY_LIMIT_MS) {
                // Only if we have a session
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    console.log("Inactivity timeout");
                    handleLogout();
                }
            }
            // Check token
            checkToken();
        }, CHECK_INTERVAL_MS);

        return () => {
            window.removeEventListener("mousemove", updateActivity);
            window.removeEventListener("keydown", updateActivity);
            window.removeEventListener("click", updateActivity);
            window.removeEventListener("scroll", updateActivity);
            clearInterval(interval);
        };
    }, [lastActivity, checkToken, handleLogout]);

    // Sync across tabs
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "auth_logout") {
                router.push("/login");
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [router]);

    return <>{children}</>;
}
