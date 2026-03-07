/// <reference types="styled-jsx" />
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/ui/copy-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatTime } from "@/lib/date-utils"
import {
  BookOpen,
  MessageCircle,
  Calendar,
  User,
  Heart,
  Zap,
  Menu,
  PanelLeftClose,
  X,
  ArrowRight,
  Shield,
  Loader2
} from "lucide-react"
import { MarkdownRenderer } from "./markdown-renderer"
import { useChatSessions } from "@/hooks/use-chat-sessions"
import { ChatSessionsSidebar } from "./chat-sessions-sidebar"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "suggestion" | "health-tip"
}

interface BlogPost {
  id: number
  title: string
  content: string
  created_at: string
}

export function PatientChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm CLARA, your Personal Health Assistant. I'm here to provide evidence-based information about your health and wellness. How are you feeling today?",
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null)
  const [isLoadingArticle, setIsLoadingArticle] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tab, setTab] = useState<"chat" | "blog">("chat")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
  } = useChatSessions("patient")

  const handleSelectSession = async (sessionId: number | string) => {
    setCurrentSessionId(sessionId)
    setIsLoading(true)
    try {
      const history = await getSessionHistory(sessionId)
      if (history && history.length > 0) {
        const formattedMessages: Message[] = history.map((msg) => ({
          id: msg.message_id.toString(),
          content: msg.content,
          sender: msg.role === "user" ? "user" : "bot",
          timestamp: new Date(msg.timestamp),
          type: "text",
        }))
        setMessages(formattedMessages)
      } else {
        setMessages([
          {
            id: "1",
            content: "Hello! I'm CLARA, your Personal Health Assistant. I'm here to provide evidence-based information about your health and wellness. How are you feeling today?",
            sender: "bot",
            timestamp: new Date(),
            type: "text",
          },
        ])
      }
    } catch (error) {
      console.error("Failed to load history:", error)
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNewChat = () => {
    setCurrentSessionId(null)
    setMessages([
      {
        id: "1",
        content: "Hello! I'm CLARA, your Personal Health Assistant. I'm here to provide evidence-based information about your health and wellness. How are you feeling today?",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
        startDate: new Date(),
      } as any, // startDate is not in Message type but was used in previous code? Actually checking types, Message doesn't have startDate. Removing it if it causes issues, but let's keep it clean.
    ])
  }

  const handleDeleteSession = async (sessionId: number | string) => {
    const success = await deleteSession(sessionId)
    if (success) {
      toast({
        title: "Success",
        description: "Session deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      })
    }
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when streaming new content
  useEffect(() => {
    if (isStreaming && streamingContent) {
      scrollToBottom()
    }
  }, [streamingContent, isStreaming])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent])

  const quickSuggestions = [
    "Tell me about heart-healthy foods",
    "What are signs of high blood pressure?",
    "How can I improve my cardiovascular health?",
    "What should I know about chest pain?",
  ]

  useEffect(() => {
    fetchBlogPosts()
  }, [])

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLElement | null
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        })
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, isTyping, scrollToBottom])

  const fetchBlogPosts = async () => {
    try {
      const apiUrl = `/api/proxy/articles`

      const response = await fetch(apiUrl)

      if (response.status === 401) {
        window.location.href = '/login'
        return
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: apiUrl,
        })
        throw new Error(`API request failed with status ${response.status}`)
      }

      const posts = await response.json()
      setBlogPosts(posts)
    } catch (error) {
      console.error("Failed to fetch blog posts:", error)
      const savedPosts = localStorage.getItem("blogPosts")
      if (savedPosts) {
        setBlogPosts(JSON.parse(savedPosts))
      }
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)
    setIsLoading(true)
    setIsStreaming(true)
    setStreamingContent("")

    const tempBotMessage: Message = {
      id: `temp-${Date.now()}`,
      content: "",
      sender: "bot" as const,
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, tempBotMessage])

    try {
      const response = await fetch(`/api/proxy/patient/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: inputMessage,
          session_id: currentSessionId
        }),
      })

      if (response.status === 401) {
        window.location.href = '/login'
        return
      }

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      // Check for new session ID in headers
      const xSessionId = response.headers.get("X-Session-ID")
      if (xSessionId && !currentSessionId) {
        setCurrentSessionId(xSessionId)

        // ChatGPT style: auto-generate a concise name from the first message
        const generatedName = inputMessage.length > 40
          ? inputMessage.substring(0, 40).trim() + "..."
          : inputMessage;

        await updateSessionName(xSessionId, generatedName)
        fetchSessions() // Refresh sessions list to show the new one
      }

      if (!response.body) {
        throw new Error("No response body")
      }

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
          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage.id === tempBotMessage.id) {
              return [...newMessages.slice(0, -1), { ...lastMessage, content: content }]
            }
            return newMessages
          })
        }
      }
    } catch (error) {
      console.error("Error during streaming:", error)
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, but I'm unable to process your message at this time. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev.filter((m) => m.id !== tempBotMessage.id), botResponse])
    } finally {
      setIsTyping(false)
      setIsLoading(false)
      setIsStreaming(false)
      setStreamingContent("")
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

  const handleReadMore = async (article: BlogPost) => {
    setSelectedArticle(article) // Show basic info first
    setIsModalOpen(true)
    setIsLoadingArticle(true)

    try {
      const response = await fetch(`/api/proxy/articles/${article.id}`)
      if (response.status === 401) {
        window.location.href = '/login'
        return
      }
      if (response.ok) {
        const detailedArticle = await response.json()
        setSelectedArticle(detailedArticle)
      } else {
        console.error("Failed to fetch detailed article")
      }
    } catch (e) {
      console.error("Error fetching article details:", e)
    } finally {
      setIsLoadingArticle(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedArticle(null)
  }

  const messageVariants = {
    hidden: { opacity: 0, y: 8, filter: "blur(6px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans relative overflow-hidden text-slate-900">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-rose-200/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-300/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-sm relative z-50"
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
              >
                {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="relative w-10 h-10 transition-transform hover:scale-105">
                <Image
                  src="/MetamedMDlogo (2).png"
                  alt="MetaMedMD Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h2 className="font-black text-2xl text-rose-950 tracking-tighter uppercase leading-none">CLARA</h2>
                <p className="text-[10px] text-rose-50 font-black uppercase tracking-widest mt-1 bg-rose-500 px-2 py-0.5 rounded-full inline-block">Patient Assistant</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-rose-100 text-slate-500 bg-white hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 shadow-sm font-bold rounded-xl"
            >
              Sign Out
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-2 relative z-10 overflow-hidden">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "chat" | "blog")} className="flex-1 flex flex-col overflow-hidden">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="bg-white/50 backdrop-blur-sm px-4 pb-2"
          >
            <div className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 bg-rose-50/50 p-1 h-12 rounded-2xl border border-rose-100 shadow-sm">
                <TabsTrigger
                  value="chat"
                  className="flex items-center gap-2 rounded-xl transition-all duration-300 h-10 text-slate-500 data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/20 font-black uppercase tracking-widest text-[10px]"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={3} />
                  <span>Clinical Chat</span>
                </TabsTrigger>
                <TabsTrigger
                  value="blog"
                  className="flex items-center gap-2 rounded-xl transition-all duration-300 h-10 text-slate-500 data-[state=active]:bg-rose-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/20 font-black uppercase tracking-widest text-[10px]"
                >
                  <BookOpen className="h-4 w-4" strokeWidth={3} />
                  <span>Health Articles</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </motion.div>

          {/* Tab Content area */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="chat" className="h-full flex flex-row mt-0 overflow-hidden outline-none">
              <AnimatePresence>
                {isSidebarOpen && (
                  <>
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 300, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="fixed md:relative inset-y-0 left-0 z-40 lg:z-10 bg-white border-r border-rose-100 shadow-2xl md:shadow-none overflow-hidden"
                    >
                      <div className="flex md:hidden justify-end p-2">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="hover:bg-rose-50 rounded-lg">
                          <X className="h-5 w-5 text-rose-300" />
                        </Button>
                      </div>
                      <ChatSessionsSidebar
                        sessions={sessions}
                        currentSessionId={currentSessionId}
                        onSelectSession={(id) => {
                          handleSelectSession(id);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        onCreateSession={() => {
                          handleCreateNewChat();
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        onDeleteSession={handleDeleteSession}
                        onRenameSession={async (id, name) => {
                          const success = await updateSessionName(id, name);
                          if (success) {
                            toast({ title: "Success", description: "Memory updated" });
                          } else {
                            toast({ title: "Error", description: "Sync failure", variant: "destructive" });
                          }
                        }}
                        isLoading={isLoadingSessions}
                        role="patient"
                      />
                    </motion.div>
                    {/* Mobile Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSidebarOpen(false)}
                      className="fixed inset-0 bg-rose-950/20 backdrop-blur-sm z-30 md:hidden"
                    />
                  </>
                )}
              </AnimatePresence>

              <div className="flex-1 flex flex-col min-w-0 bg-rose-50/10">
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-6 lg:p-10">
                  <div className="max-w-4xl mx-auto space-y-10">
                    <AnimatePresence initial={false}>
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, y: 10 }}
                          variants={messageVariants}
                          transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div className={cn(
                            "flex items-start gap-4 max-w-[85%] lg:max-w-3xl group",
                            message.sender === "user" ? "flex-row-reverse" : "flex-row"
                          )}>
                            <div className={cn(
                              "w-10 h-10 rounded-[1.25rem] border flex items-center justify-center shrink-0 mt-2 shadow-sm transition-transform group-hover:scale-110 duration-500",
                              message.sender === "user"
                                ? "bg-rose-500 border-rose-400 text-white shadow-rose-500/20"
                                : "bg-white border-rose-100 text-rose-500"
                            )}>
                              {message.sender === "user" ? <User className="w-5 h-5" /> : <Heart className="w-5 h-5 fill-current" />}
                            </div>

                            <div className={cn("flex flex-col", message.sender === "user" ? "items-end" : "items-start")}>
                              <div
                                className={cn(
                                  "px-6 py-5 rounded-[2.5rem] shadow-sm transition-all duration-500",
                                  message.sender === "user"
                                    ? "bg-rose-500 text-white rounded-tr-none shadow-rose-500/10 border border-rose-400"
                                    : "bg-white text-slate-800 border border-rose-100 rounded-tl-none hover:shadow-md hover:border-rose-200"
                                )}
                              >
                                <div className="text-sm leading-relaxed font-medium">
                                  <MarkdownRenderer
                                    content={message.content}
                                    variant={message.sender === "user" ? "user" : "doctor"}
                                  />
                                </div>

                                <div className="flex items-center justify-between mt-3 gap-6">
                                  <p className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.2em]",
                                    message.sender === "user" ? "text-rose-100" : "text-slate-400"
                                  )}>
                                    {formatTime(message.timestamp)}
                                  </p>
                                  {message.sender === "bot" && (
                                    <CopyButton
                                      text={message.content}
                                      size="sm"
                                      variant="ghost"
                                      className="opacity-0 group-hover:opacity-100 transition-all text-slate-300 hover:text-rose-500 h-6 w-6"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </ScrollArea>

                <div className="p-6 bg-white/80 backdrop-blur-xl border-t border-rose-100">
                  <div className="max-w-4xl mx-auto">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/10 to-rose-600/10 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                      <div className="relative flex gap-3 items-center">
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Ask CLARA about symptoms, wellness, or medical guidelines..."
                          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                          className="h-16 bg-white border-rose-100 rounded-[2rem] px-8 text-slate-900 placeholder:text-slate-300 focus-visible:ring-4 focus-visible:ring-rose-500/5 focus-visible:border-rose-300 transition-all shadow-xl shadow-rose-500/5 font-medium border-2"
                        />
                        <button
                          onClick={() => handleSendMessage()}
                          disabled={!inputMessage.trim() || isLoading}
                          className={cn(
                            "h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 shadow-lg active:scale-95 group",
                            inputMessage.trim()
                              ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20"
                              : "bg-rose-50 text-rose-200 cursor-not-allowed border-2 border-rose-100"
                          )}
                        >
                          {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <Zap className={cn("w-6 h-6 transition-transform group-hover:scale-110", inputMessage.trim() && "fill-current")} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-6">
                      <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-300">
                        Clinical AI Framework · Always verify critical events
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="blog" className="h-full mt-0 outline-none overflow-hidden flex flex-col">
              <ScrollArea className="flex-1 bg-rose-50/10">
                <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 lg:py-24">
                  <motion.div
                    className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="max-w-xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest mb-6">
                        <BookOpen className="w-3 h-3" />
                        <span>Clinical Intelligence Base</span>
                      </div>
                      <h2 className="text-4xl lg:text-5xl font-black text-rose-950 uppercase tracking-tighter leading-none mb-6">
                        Medical <br />
                        <span className="text-rose-500">Discovery Library</span>
                      </h2>
                      <p className="text-slate-500 font-medium leading-relaxed">Expert-reviewed clinical perspectives and health insights curated for your active wellness journey.</p>
                    </div>
                  </motion.div>

                  {blogPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                      <AnimatePresence>
                        {blogPosts.map((post, index) => (
                          <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group h-full"
                          >
                            <div
                              onClick={() => handleReadMore(post)}
                              className="h-full bg-white rounded-[3rem] border border-rose-100 p-1 shadow-sm hover:shadow-2xl hover:shadow-rose-500/10 hover:-translate-y-2 hover:border-rose-300 transition-all duration-700 overflow-hidden cursor-pointer flex flex-col"
                            >
                              <div className="p-8 lg:p-10 flex flex-col flex-1">
                                <div className="flex items-center justify-between mb-8">
                                  <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500">
                                    <BookOpen className="w-6 h-6" />
                                  </div>
                                  <div className="px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                  </div>
                                </div>
                                <h3 className="text-xl lg:text-2xl font-black text-rose-950 mb-6 group-hover:text-rose-600 transition-colors uppercase tracking-tight leading-tight" title={post.title}>
                                  {post.title}
                                </h3>
                                <p className="text-slate-500 line-clamp-4 leading-relaxed font-medium mb-12 flex-1">
                                  {post.content}
                                </p>
                                <div className="flex items-center justify-between pt-6 border-t border-rose-50">
                                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Scientific Review</span>
                                  <div className="w-8 h-8 rounded-full border border-rose-100 flex items-center justify-center group-hover:bg-rose-50 transition-all">
                                    <ArrowRight className="w-4 h-4 text-rose-500 translate-x-0 group-hover:translate-x-1 transition-transform" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-rose-100">
                      <div className="mx-auto w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-8 border border-rose-100">
                        <BookOpen className="w-10 h-10 text-rose-200" />
                      </div>
                      <h3 className="text-xl font-black text-rose-950 uppercase tracking-widest">Library Empty</h3>
                      <p className="text-slate-400 font-medium max-w-xs mx-auto mt-4">Check back soon for validated medical insights and community updates.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </main>

      {/* Article Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-white border-0 shadow-2xl rounded-[3rem]">
          {isLoadingArticle ? (
            <div className="flex flex-col items-center justify-center h-[600px] gap-6">
              <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Retrieving Clinical Asset...</p>
            </div>
          ) : selectedArticle ? (
            <div className="h-full flex flex-col">
              <div className="h-80 relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-rose-600" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="absolute inset-0 p-12 lg:p-16 flex flex-col justify-end">
                  <div className="flex items-center gap-3 text-rose-100 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(selectedArticle.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] max-w-3xl">
                    {selectedArticle.title}
                  </h1>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="absolute top-8 right-8 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 z-10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-12 lg:p-16">
                  <div className="prose prose-sm md:prose-base max-w-none prose-p:text-slate-600 prose-headings:text-rose-950 prose-strong:text-rose-700">
                    <MarkdownRenderer content={selectedArticle.content} variant="doctor" />
                  </div>
                  <div className="mt-20 pt-12 border-t border-rose-50 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                        <Shield className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-rose-950 uppercase tracking-widest">Medical Board Review</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Validated for Public Health Discovery</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleCloseModal}
                      className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-10 h-14 font-black uppercase tracking-widest text-[10px]"
                    >
                      Close Library Asset
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
