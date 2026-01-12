"use client"

import { useState, useCallback, useEffect } from "react"

export interface Session {
    session_id: number | string
    session_name: string
    message_count: number
    created_at: string
    last_message_at: string | null
    status?: string
    current_memory_count?: number
}

export interface ChatMessage {
    message_id: number | string
    content: string
    role: "user" | "bot" | "assistant" | "system" | "doctor" | "ai"
    timestamp: string
    message_data?: any
}

export function useChatSessions(role: "patient" | "doctor") {
    const [sessions, setSessions] = useState<Session[]>([])
    const [currentSessionId, setCurrentSessionId] = useState<number | string | null>(null)
    const [isLoadingSessions, setIsLoadingSessions] = useState(false)

    const fetchSessions = useCallback(async () => {
        setIsLoadingSessions(true)
        try {
            const response = await fetch(`/api/proxy/${role}/sessions`)
            if (response.status === 401) {
                window.location.href = '/login'
                return
            }
            if (response.ok) {
                const data = await response.json()
                setSessions(data.sessions || [])
            }
        } catch (error) {
            console.error(`Failed to fetch ${role} sessions:`, error)
        } finally {
            setIsLoadingSessions(false)
        }
    }, [role])

    const createSession = useCallback(async (name?: string) => {
        try {
            const response = await fetch(`/api/proxy/${role}/sessions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_name: name }),
            })
            if (response.status === 401) {
                window.location.href = '/login'
                return null
            }
            if (response.ok) {
                const newSession = await response.json()
                setSessions((prev) => [newSession, ...prev])
                return newSession
            }
        } catch (error) {
            console.error(`Failed to create ${role} session:`, error)
        }
        return null
    }, [role])

    const deleteSession = useCallback(async (sessionId: number | string) => {
        try {
            const response = await fetch(`/api/proxy/${role}/sessions/${sessionId}`, {
                method: "DELETE",
            })
            if (response.status === 401) {
                window.location.href = '/login'
                return false
            }
            if (response.ok) {
                setSessions((prev) => prev.filter((s) => s.session_id !== sessionId))
                if (currentSessionId === sessionId) {
                    setCurrentSessionId(null)
                }
                return true
            }
        } catch (error) {
            console.error(`Failed to delete ${role} session:`, error)
        }
        return false
    }, [role, currentSessionId])

    const getSessionHistory = useCallback(async (sessionId: number | string) => {
        try {
            const response = await fetch(`/api/proxy/${role}/sessions/${sessionId}/history?limit=50`)
            if (response.status === 401) {
                window.location.href = '/login'
                return []
            }
            if (response.ok) {
                const data = await response.json()
                return data.messages as ChatMessage[]
            }
        } catch (error) {
            console.error(`Failed to fetch session history:`, error)
        }
        return []
    }, [role])

    const updateSessionName = useCallback(async (sessionId: number | string, newName: string) => {
        try {
            const response = await fetch(`/api/proxy/${role}/sessions/${sessionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_name: newName }),
            })
            if (response.status === 401) {
                window.location.href = '/login'
                return false
            }
            if (response.ok) {
                setSessions((prev) =>
                    prev.map((s) => s.session_id === sessionId ? { ...s, session_name: newName } : s)
                )
                return true
            }
        } catch (error) {
            console.error(`Failed to rename ${role} session:`, error)
        }
        return false
    }, [role])

    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    return {
        sessions,
        currentSessionId,
        setCurrentSessionId,
        isLoadingSessions,
        fetchSessions,
        createSession,
        deleteSession,
        updateSessionName,
        getSessionHistory,
    }
}
