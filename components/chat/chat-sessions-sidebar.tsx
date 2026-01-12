"use client"

import { Session } from "@/hooks/use-chat-sessions"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, Trash2, Clock, MessageCircle, Edit2, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

import { useState } from "react"

interface ChatSessionsSidebarProps {
    sessions: Session[]
    currentSessionId: number | string | null
    onSelectSession: (id: number | string) => void
    onCreateSession: () => void
    onDeleteSession: (id: number | string) => void
    onRenameSession?: (id: number | string, newName: string) => Promise<void>
    isLoading?: boolean
    role: "patient" | "doctor"
}

export function ChatSessionsSidebar({
    sessions,
    currentSessionId,
    onSelectSession,
    onCreateSession,
    onDeleteSession,
    onRenameSession,
    isLoading,
    role
}: ChatSessionsSidebarProps) {
    const [editingSessionId, setEditingSessionId] = useState<string | number | null>(null)
    const [editName, setEditName] = useState("")

    const handleSaveRename = async (sessionId: string | number) => {
        if (onRenameSession && editName.trim()) {
            await onRenameSession(sessionId, editName)
        }
        setEditingSessionId(null)
    }

    return (
        <div className="flex flex-col h-full bg-[#0F172A] border-r border-slate-800 w-72">
            <div className="p-4 border-b border-slate-800">
                <Button
                    onClick={onCreateSession}
                    className="w-full justify-start gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-900/20 transition-all duration-200 font-medium"
                >
                    <Plus className="h-4 w-4" />
                    New {role === "patient" ? "Health Chat" : "Clinical Session"}
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                    {isLoading ? (
                        <div className="flex flex-col gap-2 p-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 bg-slate-800 animate-pulse rounded-xl" />
                            ))}
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 border-dashed">
                                <MessageCircle className="h-8 w-8 text-slate-500" />
                            </div>
                            <p className="text-sm text-slate-400 font-medium">No sessions yet</p>
                            <p className="text-xs text-slate-500 mt-1">Start a conversation to see it here</p>
                        </div>
                    ) : (
                        <AnimatePresence initial={false}>
                            {sessions.map((session) => (
                                <motion.div
                                    key={session.session_id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="group relative"
                                >
                                    {editingSessionId === session.session_id ? (
                                        <div className="p-3 bg-slate-800/80 rounded-xl border border-teal-500/50">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    className="flex-1 bg-slate-900 border-teal-500 rounded px-2 py-1 text-sm outline-none border focus:ring-1 focus:ring-teal-500 text-slate-200"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleSaveRename(session.session_id)
                                                        if (e.key === "Escape") setEditingSessionId(null)
                                                    }}
                                                    onBlur={() => handleSaveRename(session.session_id)}
                                                />
                                                <button
                                                    onClick={() => handleSaveRename(session.session_id)}
                                                    className="p-1 hover:bg-slate-700 rounded transition-colors"
                                                >
                                                    <Check className="h-4 w-4 text-teal-400" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => onSelectSession(session.session_id)}
                                                className={cn(
                                                    "w-full text-left p-3 rounded-xl transition-all duration-200 flex flex-col gap-1.5",
                                                    currentSessionId === session.session_id
                                                        ? "bg-teal-900/20 border border-teal-500/30 shadow-sm"
                                                        : "hover:bg-slate-800/50 border border-transparent text-slate-400 hover:text-slate-200"
                                                )}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className={cn(
                                                        "text-sm font-semibold truncate flex-1",
                                                        currentSessionId === session.session_id ? "text-teal-400" : "text-slate-300"
                                                    )}>
                                                        {session.session_name || `Session ${session.session_id}`}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <MessageSquare className="h-3 w-3" />
                                                        <span>{session.message_count} messages</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>
                                                            {session.last_message_at
                                                                ? formatDistanceToNow(new Date(session.last_message_at), { addSuffix: true })
                                                                : formatDistanceToNow(new Date(session.created_at), { addSuffix: true })
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>

                                            <div className="absolute right-2 top-2.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {onRenameSession && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-slate-500 hover:text-teal-400 hover:bg-teal-500/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingSessionId(session.session_id);
                                                            setEditName(session.session_name || `Session ${session.session_id}`);
                                                        }}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteSession(session.session_id);
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
