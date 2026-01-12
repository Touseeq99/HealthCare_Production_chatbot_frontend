"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";

// Helper to read cookie by name
const getCookie = (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
};

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes
const CHECK_INTERVAL_MS = 30 * 1000; // 30 seconds
const REFRESH_THRESHOLD_MS = 1 * 60 * 1000; // 1 minute

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [lastActivity, setLastActivity] = useState(Date.now());

    const handleLogout = useCallback(async () => {
        try {
            await axios.post("/api/auth/logout");
        } catch (e) {
            console.error("Logout failed", e);
        } finally {
            // Clear all client-side storage
            localStorage.clear();
            sessionStorage.clear();

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
        const expiresStr = getCookie("tokenExpires");
        if (!expiresStr) return;

        const expiresAt = new Date(expiresStr).getTime();
        const now = Date.now();
        const timeLeft = expiresAt - now;

        if (timeLeft <= 0) {
            // Expired
            console.log("Token expired, logging out");
            handleLogout();
        } else if (timeLeft < REFRESH_THRESHOLD_MS) {
            // Refresh needed
            try {
                console.log("Token expiring soon, refreshing...");
                await axios.post("/api/auth/refresh");
                console.log("Token refreshed");
            } catch (e) {
                console.error("Auto-refresh failed", e);
                // If refresh fails due to 401, it likely means refresh token is invalid
                // logic is handled in api-client usually, but this is a direct call
                handleLogout();
            }
        }
    }, [handleLogout]);

    // Activity Monitor
    useEffect(() => {
        const updateActivity = () => setLastActivity(Date.now());

        window.addEventListener("mousemove", updateActivity);
        window.addEventListener("keydown", updateActivity);
        window.addEventListener("click", updateActivity);
        window.addEventListener("scroll", updateActivity);

        // Initial token check
        checkToken();

        const interval = setInterval(() => {
            // Check inactivity
            if (Date.now() - lastActivity > INACTIVITY_LIMIT_MS) {
                // Only if we have a session (tokenExpires exists)
                if (getCookie("tokenExpires")) {
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
