/// <reference types="styled-jsx" />
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/ui/copy-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatTime } from "@/lib/date-utils"
import { BookOpen, MessageCircle, Calendar, User, Heart, Zap, Menu, PanelLeftClose, X } from "lucide-react"
import { MarkdownRenderer } from "./markdown-renderer"
import { useChatSessions } from "@/hooks/use-chat-sessions"
import { ChatSessionsSidebar } from "./chat-sessions-sidebar"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

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
    await fetch("/api/auth/logout", { method: "POST" })
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    window.location.href = "/login"
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
    <div className="min-h-screen bg-[#0F172A] flex flex-col font-sans relative overflow-hidden text-slate-200">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-sm relative z-10"
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
                className="text-slate-400 hover:text-teal-400 hover:bg-slate-800"
              >
                {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <div className="w-10 h-10 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/10 group">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="group-hover:text-teal-400 text-teal-500"
                >
                  <Heart className="w-5 h-5 fill-current" strokeWidth={2.5} />
                </motion.div>
              </div>
              <div>
                <h2 className="font-bold text-2xl text-white tracking-tight">CLARA</h2>
                <p className="text-xs text-teal-500 font-medium uppercase tracking-wider">Patient Assistant</p>
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
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all duration-300 shadow-sm"
              >
                Sign Out
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-2 relative z-10">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "chat" | "blog")} className="flex-1 flex flex-col">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 px-4"
          >
            <div className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800 p-1 h-12 rounded-xl border border-slate-700">
                <TabsTrigger
                  value="chat"
                  className="flex items-center gap-2 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-lg transition-all duration-200 h-10 text-slate-400 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2} />
                  <span className="font-medium">Chat Assistant</span>
                </TabsTrigger>
                <TabsTrigger
                  value="blog"
                  className="flex items-center gap-2 data-[state=active]:bg-teal-500 data-[state=active]:text-white rounded-lg transition-all duration-200 h-10 text-slate-400 hover:text-white"
                >
                  <BookOpen className="h-4 w-4" strokeWidth={2} />
                  <span className="font-medium">Health Articles ({blogPosts.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </motion.div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-row mt-0 overflow-hidden">
            <AnimatePresence>
              {isSidebarOpen && (
                <>
                  <motion.div
                    initial={{ width: 0, x: -20, opacity: 0 }}
                    animate={{ width: 288, x: 0, opacity: 1 }}
                    exit={{ width: 0, x: -20, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="fixed md:relative inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 shadow-xl md:shadow-none overflow-hidden"
                  >
                    <div className="flex md:hidden justify-end p-2">
                      <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                        <X className="h-5 w-5 text-slate-400" />
                      </Button>
                    </div>
                    <ChatSessionsSidebar
                      sessions={sessions}
                      currentSessionId={currentSessionId}
                      onSelectSession={(id) => {
                        handleSelectSession(id);
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      onCreateSession={() => {
                        handleCreateNewChat();
                        if (window.innerWidth < 768) setIsSidebarOpen(false);
                      }}
                      onDeleteSession={handleDeleteSession}
                      onRenameSession={async (id, name) => {
                        const success = await updateSessionName(id, name);
                        if (success) {
                          toast({ title: "Success", description: "Chat renamed" });
                        } else {
                          toast({ title: "Error", description: "Failed to rename chat", variant: "destructive" });
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
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                  />
                </>
              )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col min-w-0">
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 max-h-[calc(100vh-220px)] overflow-y-auto">
                <div className="max-w-3xl mx-auto space-y-6 px-2">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, y: 4, filter: "blur(3px)" }}
                        variants={messageVariants}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex items-start gap-4 max-w-lg group">
                          {message.sender === "bot" && (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                              className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm"
                            >
                              <Heart className="w-4 h-4 text-teal-400" strokeWidth={2} />
                            </motion.div>
                          )}

                          <div
                            className={`px-5 py-4 rounded-2xl shadow-sm min-w-[80px] border ${message.sender === "user"
                              ? "bg-teal-600 text-white border-teal-500 rounded-br-sm"
                              : "bg-slate-800 text-slate-200 border-slate-700 rounded-bl-sm"
                              }`}
                          >
                            {message.type === "health-tip" ? (
                              <>
                                <div className="flex items-center gap-2 mb-2">
                                  <motion.div
                                    animate={{
                                      scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      repeatType: "loop",
                                    }}
                                  >
                                    <Zap className="w-3 h-3 text-amber-400" />
                                  </motion.div>
                                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">Health Tip</span>
                                </div>
                                <div className="text-sm leading-relaxed">
                                  <MarkdownRenderer content={message.content} />
                                </div>
                              </>
                            ) : message.sender === "bot" && message.id.startsWith("temp-") && !message.content ? (
                              <div className="h-5 flex items-center gap-1">
                                <motion.span
                                  className="inline-block w-2 h-2 rounded-full bg-teal-400"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                                />
                                <motion.span
                                  className="inline-block w-2 h-2 rounded-full bg-teal-400"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{
                                    duration: 1,
                                    repeat: Number.POSITIVE_INFINITY,
                                    delay: 0.2,
                                  }}
                                />
                                <motion.span
                                  className="inline-block w-2 h-2 rounded-full bg-teal-400"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{
                                    duration: 1,
                                    repeat: Number.POSITIVE_INFINITY,
                                    delay: 0.4,
                                  }}
                                />
                              </div>
                            ) : (
                              <div className={`text-sm leading-relaxed ${message.sender === "user" ? "text-white" : "text-slate-200"}`}>
                                <MarkdownRenderer content={message.content} variant={message.sender === "bot" ? "patient" : "user"} />
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <p
                                className={`text-[10px] ${message.sender === "user" ? "text-teal-100/70" : "text-slate-500"
                                  }`}
                              >
                                {formatTime(message.timestamp)}
                              </p>
                              {message.sender === "bot" && (
                                <CopyButton
                                  text={message.content}
                                  size="sm"
                                  variant="ghost"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-teal-400 h-6 w-6"
                                />
                              )}
                            </div>
                          </div>

                          {message.sender === "user" && (
                            <motion.div
                              className="w-8 h-8 bg-teal-900/50 border border-teal-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <User className="w-4 h-4 text-teal-400" strokeWidth={2} />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              <motion.div
                className="sticky bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-4 z-20"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                  delay: 0.2
                }}
              >
                <div className="max-w-3xl mx-auto">
                  <motion.div
                    className="flex gap-3 items-center"
                    whileHover={{
                      scale: 1.005,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask CLARA about symptoms, wellness, or health topics..."
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="bg-slate-800 border-slate-700 rounded-xl px-5 py-5 text-slate-200 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-0 shadow-lg"
                    />
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => handleSendMessage()}
                        disabled={!inputMessage.trim() || isLoading}
                        className={`relative overflow-hidden rounded-xl px-6 h-12 font-medium shadow-lg transition-all duration-200 ${inputMessage.trim()
                          ? "bg-teal-500 text-white hover:bg-teal-600 shadow-teal-500/20"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                          }`}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" strokeWidth={2} />
                        )}
                        Send
                      </Button>
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-center mt-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-teal-500/50 animate-pulse"></span>
                      <span>AI-generated content. Always verify with a healthcare professional.</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog" className="flex-1 mt-0">
            <ScrollArea className="h-full p-4 max-h-[calc(100vh-150px)] overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <motion.div
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Health Insights
                  </h2>
                  <p className="text-slate-400">Expert articles curated for your wellness</p>
                </motion.div>

                {blogPosts.length > 0 ? (
                  <div className="grid gap-6">
                    <AnimatePresence>
                      {blogPosts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.08,
                            ease: [0.2, 0, 0, 1],
                          }}
                        >
                          <motion.div
                            whileHover={{
                              y: -2,
                              transition: { duration: 0.2 },
                            }}
                            className="h-full"
                          >
                            <Card className="group bg-slate-800/50 border border-slate-700 hover:border-teal-500/30 transition-all duration-300 h-full overflow-hidden shadow-sm hover:shadow-lg hover:shadow-teal-900/10">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <CardTitle
                                      className="text-xl font-bold text-slate-200 group-hover:text-teal-400 transition-colors cursor-pointer line-clamp-2"
                                      onClick={() => handleReadMore(post)}
                                    >
                                      {post.title}
                                    </CardTitle>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                                      <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-md">
                                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                                        <span className="text-xs text-slate-300">{new Date(post.created_at).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-700 transition-transform group-hover:scale-105">
                                    <BookOpen className="w-5 h-5 text-teal-500" strokeWidth={2} />
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <p className="text-slate-400 leading-relaxed line-clamp-3 mb-4">
                                  {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-teal-400 border-teal-500/30 bg-teal-500/5 hover:bg-teal-500/10 hover:text-teal-300 transition-colors"
                                  onClick={() => handleReadMore(post)}
                                >
                                  Read more
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-800/30 rounded-3xl border border-slate-800 border-dashed">
                    <div className="mx-auto w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300">No articles found</h3>
                    <p className="text-slate-500">Check back later for health insights.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>

      {/* Article Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white mb-2">{selectedArticle?.title}</DialogTitle>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              {selectedArticle?.created_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {new Date(selectedArticle.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="text-slate-300 leading-relaxed space-y-4">
              {isLoadingArticle ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                </div>
              ) : (
                <MarkdownRenderer content={selectedArticle?.content || ""} />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
