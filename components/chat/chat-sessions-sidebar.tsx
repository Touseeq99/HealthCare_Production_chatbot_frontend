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
        <div className="flex flex-col h-full bg-white border-r border-rose-100 w-72">
            <div className="p-4 border-b border-rose-100">
                <Button
                    onClick={onCreateSession}
                    className="w-full justify-start gap-2 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/10 transition-all duration-300 font-black uppercase tracking-tight py-6 rounded-xl"
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
                                <div key={i} className="h-16 bg-rose-50/50 animate-pulse rounded-xl border border-rose-100/50" />
                            ))}
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-10 px-4">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100 border-dashed">
                                <MessageCircle className="h-8 w-8 text-rose-300" />
                            </div>
                            <p className="text-sm text-slate-400 font-black uppercase tracking-widest">No sessions yet</p>
                            <p className="text-xs text-slate-400 mt-2 font-medium">Start a conversation to see it here</p>
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
                                        <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    className="flex-1 bg-white border-rose-300 rounded-lg px-2 py-1.5 text-sm outline-none border focus:ring-2 focus:ring-rose-500/20 text-slate-800 font-medium"
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
                                                    className="p-1 hover:bg-rose-500 hover:text-white rounded-lg transition-all"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => onSelectSession(session.session_id)}
                                                className={cn(
                                                    "w-full text-left p-4 rounded-xl transition-all duration-300 flex flex-col gap-2",
                                                    currentSessionId === session.session_id
                                                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
                                                        : "hover:bg-rose-50/50 border border-transparent text-slate-500 hover:text-rose-950"
                                                )}
                                            >
                                                <div className="flex items-center justify-between gap-2 text-inherit">
                                                    <span className={cn(
                                                        "text-sm font-black truncate flex-1 tracking-tight",
                                                        currentSessionId === session.session_id ? "text-white" : "text-slate-800"
                                                    )}>
                                                        {session.session_name || `Session ${session.session_id}`}
                                                    </span>
                                                </div>

                                                <div className={cn(
                                                    "flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider",
                                                    currentSessionId === session.session_id ? "text-rose-100" : "text-slate-400"
                                                )}>
                                                    <div className="flex items-center gap-1">
                                                        <MessageSquare className="h-3 w-3" />
                                                        <span>{session.message_count}</span>
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

                                            <div className="absolute right-2 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                {onRenameSession && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn(
                                                            "h-8 w-8 transition-colors",
                                                            currentSessionId === session.session_id
                                                                ? "text-rose-200 hover:text-white hover:bg-white/10"
                                                                : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                                        )}
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
                                                    className={cn(
                                                        "h-8 w-8 transition-colors",
                                                        currentSessionId === session.session_id
                                                            ? "text-rose-200 hover:text-white hover:bg-white/10"
                                                            : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                    )}
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
