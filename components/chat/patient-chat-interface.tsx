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
import { BookOpen, MessageCircle, Calendar, User, Heart, Zap } from "lucide-react"
import { MarkdownRenderer } from "./markdown-renderer"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "suggestion" | "health-tip"
}

interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  date: string
  status: "published" | "draft"
}

export function PatientChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your Cardiology Assistant. I'm here to provide educational information about heart health and general wellness. How are you feeling today?",
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tab, setTab] = useState<"chat" | "blog">("chat")

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
      const apiUrl = `/api/proxy/admin/articles`

      const response = await fetch(apiUrl)

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
      const response = await fetch(`/api/proxy/chat/patient/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: inputMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
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

  const handleReadMore = (article: BlogPost) => {
    setSelectedArticle(article)
    setIsModalOpen(true)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex flex-col font-sans relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-blue-100 rounded-full mix-blend-multiply blur-3xl animate-blob"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-[700px] h-[700px] bg-indigo-100 rounded-full mix-blend-multiply blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm relative z-10 dark:bg-slate-800/95 dark:border-slate-700"
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="group-hover:animate-pulse"
              >
                <Heart className="w-5 h-5 text-white" strokeWidth={2.5} fill="currentColor" />
              </motion.div>
            </div>
            <div>
              <h2 className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MetaMedMD</h2>
              <p className="text-sm text-blue-600 font-medium dark:text-blue-300">Your Personal Health Assistant</p>
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
                className="border-blue-200 text-blue-600 bg-white hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 shadow-sm relative overflow-hidden dark:border-blue-500/50 dark:text-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50"
              >
                <span className="relative z-10">Sign Out</span>
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-cyan-500/20 dark:to-blue-500/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
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
            className="bg-slate-800/50 backdrop-blur-sm border-b border-blue-700/30 px-4"
          >
            <div className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 bg-blue-50 p-1 h-12 rounded-xl border border-blue-100 backdrop-blur-sm dark:bg-slate-800/50 dark:border-slate-700">
                <TabsTrigger
                  value="chat"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 rounded-lg transition-all duration-200 h-10 text-blue-600 hover:bg-white/50 dark:text-blue-200 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white dark:data-[state=active]:border-slate-600"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={2} />
                  <span className="font-medium">Chat Assistant</span>
                </TabsTrigger>
                <TabsTrigger
                  value="blog"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:border data-[state=active]:border-blue-100 rounded-lg transition-all duration-200 h-10 text-blue-600 hover:bg-white/50 dark:text-blue-200 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white dark:data-[state=active]:border-slate-600"
                >
                  <BookOpen className="h-4 w-4" strokeWidth={2} />
                  <span className="font-medium">Health Articles ({blogPosts.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </motion.div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 max-h-[calc(100vh-220px)] overflow-y-auto">
              <div className="max-w-3xl mx-auto space-y-4 px-2">
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
                      <div className="flex items-start gap-3 max-w-lg group">
                        {message.sender === "bot" && (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md"
                          >
                            <Heart className="w-4 h-4 text-white" strokeWidth={2} />
                          </motion.div>
                        )}

                        <div
                          className={`px-4 py-3 rounded-2xl shadow-md min-w-[80px] border ${message.sender === "user"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/30 rounded-br-md"
                            : message.type === "health-tip"
                              ? "bg-white text-gray-800 border-blue-200 rounded-bl-md shadow-sm dark:bg-slate-700/90 dark:text-white dark:border-slate-600"
                              : "bg-white text-gray-800 border-blue-100 rounded-bl-md shadow-sm dark:bg-slate-800/90 dark:text-white dark:border-slate-700"
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
                                  <Zap className="w-3 h-3 text-cyan-400" />
                                </motion.div>
                                <span className="text-xs font-medium text-cyan-300">Health Tip</span>
                              </div>
                              <div className="text-sm leading-relaxed">
                                <MarkdownRenderer content={message.content} />
                              </div>
                            </>
                          ) : message.sender === "bot" && message.id.startsWith("temp-") && !message.content ? (
                            <div className="h-5 flex items-center gap-1">
                              <motion.span
                                className="inline-block w-2 h-2 rounded-full bg-cyan-400"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                              />
                              <motion.span
                                className="inline-block w-2 h-2 rounded-full bg-cyan-400"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{
                                  duration: 1,
                                  repeat: Number.POSITIVE_INFINITY,
                                  delay: 0.2,
                                }}
                              />
                              <motion.span
                                className="inline-block w-2 h-2 rounded-full bg-cyan-400"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{
                                  duration: 1,
                                  repeat: Number.POSITIVE_INFINITY,
                                  delay: 0.4,
                                }}
                              />
                            </div>
                          ) : (
                            <div className={`text-sm leading-relaxed ${message.sender === "user" ? "text-white" : "text-gray-800 dark:text-white"}`}>
                              <MarkdownRenderer content={message.content} variant={message.sender === "bot" ? "patient" : "user"} />
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <p
                              className={`text-xs ${message.sender === "user" ? "text-blue-100/70" : "text-blue-300/60"
                                }`}
                            >
                              {formatTime(message.timestamp)}
                            </p>
                            {message.sender === "bot" && (
                              <CopyButton
                                text={message.content}
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-300 hover:text-cyan-300"
                              />
                            )}
                          </div>
                        </div>

                        {message.sender === "user" && (
                          <motion.div
                            className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <User className="w-4 h-4 text-white" strokeWidth={2} />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            <motion.div
              className="sticky bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-blue-100 p-4 z-20 shadow-[0_-4px_20px_-8px_rgba(30,64,175,0.1)] dark:bg-slate-800/90 dark:border-slate-700"
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
                    placeholder="Ask about heart health, symptoms, or wellness..."
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="bg-white/90 border-blue-200 rounded-xl px-5 py-5 text-gray-800 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 shadow-sm transition-all duration-200 dark:bg-slate-800/90 dark:border-slate-600 dark:text-white dark:placeholder:text-gray-400"
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || isLoading}
                      className={`relative overflow-hidden rounded-xl px-6 h-12 font-medium shadow-lg transition-all duration-200 ${inputMessage.trim()
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600"
                        : "bg-slate-700/50 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" strokeWidth={2} />
                      )}
                      Send
                      {!isLoading && (
                        <motion.span
                          className="absolute inset-0 bg-white/10"
                          initial={{ opacity: 0, width: 0 }}
                          whileHover={{ opacity: 1, width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Button>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="flex items-center justify-center mt-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="bg-blue-900/40 border border-blue-700/50 rounded-xl px-4 py-2 shadow-md backdrop-blur-sm">
                    <p className="text-xs text-center text-blue-700 dark:text-blue-200">
                      <span className="font-semibold">⚕️ Medical Disclaimer:</span> For educational purposes only. Always
                      consult your healthcare provider.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
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
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
                    Cardiology Insights
                  </h2>
                  <p className="text-blue-300">Expert medical articles and health information</p>
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
                              boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.3)",
                              transition: { duration: 0.2 },
                            }}
                            className="h-full"
                          >
                            <Card className="group bg-white/95 border border-blue-100 hover:border-blue-200 transition-all duration-300 h-full overflow-hidden shadow-sm hover:shadow-md hover:bg-white dark:bg-slate-800/90 dark:border-slate-700 dark:hover:border-blue-500/50 dark:hover:bg-slate-800/95">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <CardTitle
                                      className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors cursor-pointer line-clamp-2 dark:text-white dark:group-hover:text-blue-200"
                                      onClick={() => handleReadMore(post)}
                                    >
                                      {post.title}
                                    </CardTitle>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                      <div className="flex items-center gap-1 bg-blue-50 group-hover:bg-blue-100 px-2 py-1 rounded-md transition-colors dark:bg-slate-700/50 dark:group-hover:bg-slate-600/70">
                                        <User className="w-3.5 h-3.5 text-blue-700 group-hover:text-blue-800 dark:text-blue-300 dark:group-hover:text-blue-200" />
                                        <span className="text-xs text-blue-800 group-hover:text-blue-900 dark:text-blue-200 dark:group-hover:text-blue-100">{post.author || "Admin"}</span>
                                      </div>
                                      <div className="flex items-center gap-1 bg-blue-50 group-hover:bg-blue-100 px-2 py-1 rounded-md transition-colors dark:bg-slate-700/50 dark:group-hover:bg-slate-600/70">
                                        <Calendar className="w-3.5 h-3.5 text-blue-700 group-hover:text-blue-800 dark:text-blue-300 dark:group-hover:text-blue-200" />
                                        <span className="text-xs text-blue-800 group-hover:text-blue-900 dark:text-blue-200 dark:group-hover:text-blue-100">{post.date || "No date"}</span>
                                      </div>
                                      <Badge
                                        variant="secondary"
                                        className={`ml-0 text-xs ${post.status === "published"
                                          ? "bg-green-100 text-green-800 border-green-200 group-hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700/50 dark:group-hover:bg-green-800/60"
                                          : "bg-amber-100 text-amber-800 border-amber-200 group-hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700/50 dark:group-hover:bg-amber-800/60"
                                          }`}
                                      >
                                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-blue-200 transition-transform hover:scale-105 dark:from-blue-900/30 dark:to-blue-800/30 dark:border-blue-700/50">
                                    <BookOpen className="w-5 h-5 text-blue-700 dark:text-blue-300" strokeWidth={2} />
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <p className="text-gray-700 leading-relaxed line-clamp-3 mb-4 dark:text-gray-300">
                                  {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-800 dark:text-blue-100 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 transition-colors dark:text-blue-200 dark:border-blue-700/50 dark:bg-blue-900/40 dark:hover:bg-blue-800/50"
                                  onClick={() => handleReadMore(post)}
                                >
                                  Read more
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="ml-1.5"
                                  >
                                    <path d="M5 12h14"></path>
                                    <path d="m12 5 7 7-7 7"></path>
                                  </svg>
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-blue-900/30">
                      <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-300" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2 dark:text-white">No Articles Yet</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Our cardiology team is preparing comprehensive health articles. Check back soon!
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </main>

      {/* Article Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800/95 border-blue-700/40 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-blue-50 mb-2">{selectedArticle?.title}</DialogTitle>
            <div className="flex items-center gap-4 text-sm text-blue-300 mb-4">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" strokeWidth={1.5} />
                <span>By {selectedArticle?.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" strokeWidth={1.5} />
                <span>{selectedArticle?.date}</span>
              </div>
              <Badge variant="secondary" className="bg-blue-600/40 text-cyan-300 border border-blue-600/50">
                {selectedArticle?.status}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="prose prose-invert max-w-none">
              <p className="text-blue-100 leading-relaxed whitespace-pre-wrap">{selectedArticle?.content}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-blue-700/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-cyan-400" strokeWidth={1.5} />
                </div>
                <span className="text-sm text-blue-300">Cardiology Article</span>
              </div>
              <CopyButton text={selectedArticle?.content || ""} size="sm" variant="outline" showText={true} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Global styles */}
      <style jsx global>{`
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5ff;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #bfd4ff;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #93c5fd;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Animation for page transitions */
        .page-transition-enter {
          opacity: 0;
          transform: translateY(10px);
        }
        
        .page-transition-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 300ms, transform 300ms;
        }
        
        .page-transition-exit {
          opacity: 1;
          transform: translateY(0);
        }
        
        .page-transition-exit-active {
          opacity: 0;
          transform: translateY(-10px);
          transition: opacity 300ms, transform 300ms;
        }
      `}</style>
    </div>
  )
}

