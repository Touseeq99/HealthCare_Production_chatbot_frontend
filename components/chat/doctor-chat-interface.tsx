"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/date-utils"
import {
  LogOut, Send, Bot, User, Loader2,
  MessageSquare, Plus, Menu, Shield, Brain, X, Trash2, Clock, History, Edit2, Check,
  Stethoscope, Activity, ClipboardList, Microscope, ChevronLeft
} from "lucide-react"
import { useChatSessions } from "@/hooks/use-chat-sessions"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import {
  Root as Tabs,
  List as TabsList,
  Trigger as TabsTrigger,
  Content as TabsContent
} from "@radix-ui/react-tabs"
import { EvidenceEngine } from "@/components/evidence/EvidenceEngine"
import { ScrollArea } from "@/components/ui/scroll-area"
import { StructuredResponse } from "./structured-response"
import { memo } from "react"
import { ChatSessionsSidebar } from "./chat-sessions-sidebar"
import { AIClinicalNote } from "@/components/ai-clinical-note/ai-clinical-note"
import { DifferentialDiagnosis } from "@/components/differential-diagnosis/differential-diagnosis"
import { ECGReport } from "@/components/ecg/ecg-report"

interface Message {
  id: string
  content: string
  sender: "doctor" | "ai"
  timestamp: Date
}

const MessageBubble = memo(({ message, isAi }: { message: Message; isAi: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full mb-6",
        isAi ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "flex gap-3 max-w-[85%] sm:max-w-[75%]",
          isAi ? "flex-row" : "flex-row-reverse"
        )}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shadow-md border",
              isAi
                ? "bg-rose-50 border-rose-100 text-rose-600"
                : "bg-rose-600 border-rose-500 text-white"
            )}
          >
            {isAi ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </div>
        </div>

        {/* Message Content */}
        <div className={cn("flex flex-col", isAi ? "items-start" : "items-end")}>
          <div
            className={cn(
              "px-5 py-4 rounded-2xl shadow-sm",
              isAi
                ? "bg-white text-slate-800 border border-rose-100 rounded-tl-sm"
                : "bg-rose-600 text-white border border-rose-500 rounded-tr-sm"
            )}
          >
            {isAi ? (
              <div className="prose prose-sm max-w-none prose-p:text-slate-700 prose-headings:text-slate-900 prose-strong:text-rose-600">
                <StructuredResponse content={message.content} />
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
            )}
          </div>
          <span className="text-[10px] text-slate-500 mt-1.5 px-1 font-medium">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </motion.div>
  )
})

MessageBubble.displayName = "MessageBubble"

const TypingIndicator = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl w-fit border border-rose-100 shadow-sm transition-all duration-500"
  >
    <div className="flex gap-1.5">
      <div className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:-0.3s]" />
      <div className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:-0.15s]" />
      <div className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-bounce" />
    </div>
    <span className="text-xs font-black text-rose-500 animate-pulse uppercase tracking-wider">{message}</span>
  </motion.div>
)

export function DoctorChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("chat") // Track active tab for sidebar logic

  const { toast } = useToast()
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    isLoadingSessions,
    createSession,
    deleteSession,
    updateSessionName,
    getSessionHistory,
    fetchSessions
  } = useChatSessions("doctor")

  const handleSelectSession = async (sessionId: number | string) => {
    setCurrentSessionId(sessionId)
    setIsLoading(true)
    try {
      const history = await getSessionHistory(sessionId)
      if (history && history.length > 0) {
        setMessages(history.map(msg => ({
          id: msg.message_id.toString(),
          content: msg.content,
          sender: msg.role === "user" ? "doctor" : "ai",
          timestamp: new Date(msg.timestamp)
        })))
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error("Failed to load history:", error)
      toast({ title: "Error", description: "Failed to load chat history", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNewChat = () => {
    setCurrentSessionId(null)
    setMessages([])
  }

  const handleDeleteSession = async (sessionId: number | string) => {
    const success = await deleteSession(sessionId)
    if (success) {
      toast({ title: "Success", description: "Session deleted successfully" })
    } else {
      toast({ title: "Error", description: "Failed to delete session", variant: "destructive" })
    }
  }

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputMessage])

  // Auto-focus on mount and when starting new chat
  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
    return () => clearTimeout(focusTimeout)
  }, [messages.length === 0])

  const handleSendMessage = async (retryCount = 0) => {
    if (!inputMessage.trim() && !retryCount) return
    if (isLoading && !retryCount) return

    const now = new Date()
    if (retryCount === 0) {
      const newMessage: Message = {
        id: `user-${now.getTime()}`,
        content: inputMessage,
        sender: "doctor",
        timestamp: now,
      }
      setMessages((prev) => [...prev, newMessage])
      setInputMessage("")
      if (textareaRef.current) textareaRef.current.style.height = "auto"
    }

    const messageToSend = retryCount === 0 ? inputMessage : messages[messages.length - 1].content

    setIsLoading(true)
    setIsStreaming(true)
    setStreamingContent("")
    setStatusMessage("Query sent")

    const statusTimeout = setInterval(() => {
      setStatusMessage(prev => {
        if (prev === "Query sent") return "Searching Database"
        if (prev === "Searching Database") return "Making answer"
        return prev
      })
    }, 2500)

    try {
      const response = await fetch(`/api/proxy/doctor/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          session_id: currentSessionId
        }),
      })

      // Capture session ID if provided by backend
      const xSessionId = response.headers.get("X-Session-ID")
      if (xSessionId && !currentSessionId) {
        setCurrentSessionId(xSessionId)

        // Auto-generate name from first message (ChatGPT style)
        const generatedName = messageToSend.length > 40
          ? messageToSend.substring(0, 40).trim() + "..."
          : messageToSend

        await updateSessionName(xSessionId, generatedName)
        fetchSessions()
      }

      if (response.status === 401) {
        if (retryCount < 1) {
          const refreshRes = await fetch("/api/auth/refresh", { method: "POST" })
          if (refreshRes.ok) {
            await new Promise((resolve) => setTimeout(resolve, 100))
            await handleSendMessage(retryCount + 1)
            return
          }
        }
        window.location.href = '/login'
        return
      }

      if (!response.ok) throw new Error("Network response failure")
      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let content = ""

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          content += chunk
          setStreamingContent(content)
        }
      }

      if (content.trim()) {
        const now = new Date()
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg.id !== "streaming")
          return [
            ...filtered,
            { id: `ai-${now.getTime()}`, content: content, sender: "ai" as const, timestamp: now },
          ]
        })
      }
    } catch (error) {
      console.error("Error:", error)
      const now = new Date()
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${now.getTime()}`,
          content: error instanceof Error ? error.message : "Error processing request.",
          sender: "ai",
          timestamp: now,
        },
      ])
      if (error instanceof Error && error.message.includes("Session expired")) {
        setTimeout(() => (window.location.href = "/login"), 2000)
      }
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      setStreamingContent("")
      setStatusMessage("")
      clearInterval(statusTimeout)
    }
  }

  const handleLogout = async () => {
    // 1. Invalidate the Supabase session (clears SSR cookies set by createBrowserClient)
    await supabase.auth.signOut()
    // 2. Clear our custom auth cookies server-side
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => { })
    // 3. Clear any remaining client-side storage
    localStorage.clear()
    sessionStorage.clear()
    // 4. Hard redirect so no in-memory state survives
    window.location.replace("/login")
  }

  const displayMessages = useMemo(() => {
    if (isStreaming && streamingContent.trim()) {
      return [
        ...messages,
        { id: "streaming", content: streamingContent, sender: "ai" as const, timestamp: new Date() },
      ]
    }
    return messages
  }, [messages, isStreaming, streamingContent])

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Subtle background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-200/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-300/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex w-full h-full z-10">
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed lg:relative inset-y-0 left-0 z-50 bg-white backdrop-blur-sm border-r border-rose-100 shadow-2xl lg:shadow-none overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center">
                    <Stethoscope className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <h1 className="font-black text-rose-950 text-sm tracking-tight">CLARA MD</h1>
                    <p className="text-[10px] text-rose-500 uppercase font-black tracking-wider">Clinician Mode</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 hidden lg:flex h-8 w-8"
                    title="Collapse Sidebar"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 lg:hidden"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 flex flex-col min-h-0 p-4 space-y-4">
                  <div className="space-y-1 flex-none">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-2 mb-2">Clinical Services</p>
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { id: 'chat', label: 'Clinical Chat', icon: MessageSquare },
                        { id: 'evidence', label: 'Evidence Base', icon: Shield },
                        { id: 'note', label: 'Clinical Note', icon: ClipboardList },
                        { id: 'diff-dx', label: 'Differential Dx', icon: Microscope },
                        { id: 'ecg-report', label: 'ECG Report', icon: Activity },
                      ].map((item) => (
                        <Button
                          key={item.id}
                          variant="ghost"
                          onClick={() => setActiveTab(item.id)}
                          className={cn(
                            "w-full justify-start gap-3 h-10 px-3 rounded-lg font-bold text-xs transition-all uppercase tracking-tight",
                            activeTab === item.id
                              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:text-white"
                              : "text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-rose-100 mx-2" />

                  <div className="flex-1 min-h-0 flex flex-col">
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-2 mb-2 flex-none">Recent Sessions</p>
                    <ChatSessionsSidebar
                      sessions={sessions}
                      currentSessionId={currentSessionId}
                      onSelectSession={(id) => {
                        handleSelectSession(id);
                        setActiveTab('chat');
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      onCreateSession={() => {
                        handleCreateNewChat();
                        setActiveTab('chat');
                      }}
                      onDeleteSession={handleDeleteSession}
                      onRenameSession={async (id, name) => {
                        const success = await updateSessionName(id, name)
                        if (success) toast({ title: "Success", description: "Chat renamed" })
                        else toast({ title: "Error", description: "Failed to rename", variant: "destructive" })
                      }}
                      isLoading={isLoadingSessions}
                      role="doctor"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-rose-100 bg-rose-50/30">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors font-bold"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-white/80 backdrop-blur-md z-20">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300 transform"
                  onClick={() => setIsSidebarOpen(true)}
                  title="Expand Sidebar"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white shadow-md">
                  {activeTab === 'chat' && <MessageSquare className="w-4 h-4" />}
                  {activeTab === 'evidence' && <Shield className="w-4 h-4" />}
                  {activeTab === 'note' && <ClipboardList className="w-4 h-4" />}
                  {activeTab === 'diff-dx' && <Microscope className="w-4 h-4" />}
                  {activeTab === 'ecg-report' && <Activity className="w-4 h-4" />}
                </div>
                <h2 className="text-sm font-black text-rose-950 uppercase tracking-tight">
                  {activeTab === 'chat' && 'Clinical Chat'}
                  {activeTab === 'evidence' && 'Evidence Base'}
                  {activeTab === 'note' && 'Clinical Note'}
                  {activeTab === 'diff-dx' && 'Differential Dx'}
                  {activeTab === 'ecg-report' && 'ECG Interpretation Report'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
                <Activity className="w-3 h-3" />
                <span>System Active</span>
              </div>
            </div>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col h-full overflow-hidden m-0 relative">
            <AnimatePresence mode="wait">
              {messages.length === 0 ? (
                <motion.div
                  key="initial"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col items-center justify-center px-4 relative z-10"
                >
                  <div className="w-full max-w-3xl text-center space-y-10">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex flex-col items-center gap-6"
                    >
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-rose-100 relative group">
                        <div className="absolute inset-0 bg-rose-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50" />
                        <Stethoscope className="w-10 h-10 text-rose-500 relative z-10" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-black text-rose-950 tracking-tighter mb-2">CLARA MD</h2>
                        <p className="text-slate-500 text-lg font-medium">Advanced Clinical Decision Support System</p>
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {[
                        { icon: MessageSquare, title: "Clinical Chat", desc: "Evidence-based clinical dialogue", action: () => setInputMessage("Clinical Chat") },
                        { icon: Shield, title: "Evidence Review", desc: "Guidelines & research protocols", action: () => setInputMessage("Evidence Review") },
                        { icon: Microscope, title: "Differential Dx", desc: "Decision support & DDx ranking", action: () => setActiveTab("diff-dx") },
                        { icon: ClipboardList, title: "Clinical Notes", desc: "Generate professional documentation", action: () => setActiveTab("note") },
                      ].map((item, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + (i * 0.1) }}
                          onClick={item.action}
                          className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-rose-100/50 hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-500/5 transition-all group text-left shadow-sm"
                        >
                          <div className="p-2.5 rounded-xl bg-rose-50/50 group-hover:bg-rose-500 text-rose-500 group-hover:text-white transition-all">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block font-black text-slate-800 group-hover:text-rose-950 tracking-tight">{item.title}</span>
                            <span className="text-xs text-slate-500 group-hover:text-slate-600 font-medium">{item.desc}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col h-full overflow-hidden"
                >
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 scroll-smooth"
                  >
                    <div className="max-w-4xl mx-auto space-y-6">
                      <AnimatePresence initial={false}>
                        {displayMessages.map((msg) => (
                          <MessageBubble key={msg.id} message={msg} isAi={msg.sender === "ai"} />
                        ))}
                      </AnimatePresence>
                      {isLoading && !streamingContent && (
                        <div className="flex justify-start mb-6">
                          <TypingIndicator message={statusMessage} />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="border-t border-rose-100 bg-white/90 backdrop-blur-md p-4 lg:px-8 z-20">
              <div className="max-w-4xl mx-auto">
                <div className="relative flex items-end gap-3 bg-rose-50/30 rounded-2xl p-2 border border-rose-100 focus-within:ring-4 focus-within:ring-rose-500/10 focus-within:border-rose-300 transition-all shadow-sm">
                  <Textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Enter clinical query or patient details..."
                    className="w-full min-h-[48px] max-h-[200px] bg-transparent border-0 focus-visible:ring-0 px-4 py-3 resize-none text-base text-slate-800 placeholder:text-slate-400 font-medium"
                    disabled={isLoading}
                    rows={1}
                  />
                  <Button
                    size="icon"
                    disabled={!inputMessage.trim() || isLoading}
                    onClick={() => handleSendMessage()}
                    className={cn(
                      "h-10 w-10 rounded-xl mb-1 mr-1 transition-all duration-300",
                      inputMessage.trim()
                        ? "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 scale-100 hover:scale-105 active:scale-95"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-3 font-black uppercase tracking-[0.2em]">
                  AI-generated clinical support tool. Verify all results with standard medical protocols.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="evidence" className="h-full overflow-hidden m-0 bg-slate-50">
            <div className="h-full overflow-auto p-6">
              <div className="max-w-7xl mx-auto bg-white rounded-3xl border border-rose-100 min-h-full shadow-sm">
                <div className="p-8">
                  <h2 className="text-3xl font-black text-rose-950 mb-6 flex items-center gap-4 tracking-tighter">
                    <Shield className="w-8 h-8 text-rose-500" />
                    Evidence Engine
                  </h2>
                  <EvidenceEngine />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="note" className="h-full overflow-hidden m-0 bg-slate-50">
            <div className="h-full overflow-y-auto">
              <AIClinicalNote />
            </div>
          </TabsContent>

          <TabsContent value="diff-dx" className="h-full overflow-hidden m-0 bg-slate-50">
            <div className="h-full overflow-y-auto">
              <DifferentialDiagnosis />
            </div>
          </TabsContent>

          <TabsContent value="ecg-report" className="h-full overflow-hidden m-0 bg-slate-50">
            <div className="h-full overflow-y-auto">
              <ECGReport />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div >
  )
}
