"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/date-utils"
import { LogOut, Send, Bot, User, Loader2, Sparkles, FileText, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import { 
  Root as Tabs,
  List as TabsList,
  Trigger as TabsTrigger,
  Content as TabsContent 
} from "@radix-ui/react-tabs"
import { EvidenceEngine } from "@/components/evidence/EvidenceEngine"

interface Message {
  id: string
  content: string
  sender: "doctor" | "ai"
  timestamp: Date
}

interface ChatHistory {
  id: string
  title: string
  timestamp: Date
}

// Format message content helper function
const formatMessageContent = (content: string) => {
  if (!content) return content;
  
  // Process bold text
  let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Process headings
  formatted = formatted
    .replace(/^####\s+(.*?)$/gm, '<h4 class="text-base font-semibold mt-1 mb-0">$1</h4>')
    .replace(/^###\s+(.*?)$/gm, '<h3 class="text-lg font-semibold mt-1 mb-0">$1</h3>')
    .replace(/^##\s+(.*?)$/gm, '<h2 class="text-xl font-bold mt-2 mb-1">$1</h2>')
    .replace(/^#\s+(.*?)$/gm, '<h1 class="text-2xl font-bold mt-3 mb-2">$1</h1>');
  
  // Process lists with proper nesting
  const lines = formatted.split('\n');
  let inList = false;
  let listItems: string[] = [];
  let result: string[] = [];
  
  const processList = () => {
    if (listItems.length > 0) {
      const listHtml = `<ul class="my-0 pl-4 space-y-1">${listItems.join('')}</ul>`;
      result.push(listHtml);
      listItems = [];
    }
  };
  
  lines.forEach(line => {
    const isListItem = line.trim().match(/^[-*+]\s+/);
    const isNestedListItem = line.trim().match(/^\s+[-*+]\s+/);
    
    if (isListItem || isNestedListItem) {
      const level = (line.match(/^\s*/) || [''])[0].length;
      const content = line.trim().substring(2);
      const listItem = `<li class="pl-${Math.min(level + 1, 4)}">${content}</li>`;
      listItems.push(listItem);
      inList = true;
    } else {
      if (inList) {
        processList();
        inList = false;
      }
      result.push(line);
    }
  });
  
  processList(); // Process any remaining list items
  formatted = result.join('\n');
  
  // Process paragraphs and other block elements
  formatted = formatted
    .split('\n\n')
    .map(block => {
      block = block.trim();
      if (!block) return '';
      
      // Skip processing if already a list or heading
      if (block.startsWith('<ul>') || block.startsWith('<h')) {
        return block;
      }
      
      // Handle blockquotes
      if (block.startsWith('> ')) {
        return `<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">${block.substring(2)}</blockquote>`;
      }
      
      // Handle horizontal rules
      if (block === '---' || block === '***' || block === '___') {
        return '<hr class="my-2 border-gray-200" />';
      }
      
      // Handle paragraphs that end with : (section headers)
      if (block.endsWith(':')) {
        return `<p class="font-semibold text-lg mb-0">${block}</p>`;
      }
      
      // Regular paragraphs
      return `<p class="mb-0">${block}</p>`;
    })
    .filter(Boolean)
    .join('\n');
  
  // Process inline elements that might be left
  formatted = formatted
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>') // Inline code
    .replace(/\*([^*]+)\*/g, '<em>$1</em>') // Italics
    .replace(/\n/g, '<br />'); // Line breaks
  
  return formatted;
};

// Message component with animations
const MessageBubble = ({ message, isAi }: { message: Message, isAi: boolean }) => {
  const formattedContent = useMemo(() => formatMessageContent(message.content), [message.content])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-start gap-4 p-5 rounded-xl shadow-sm",
        isAi 
          ? "bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50" 
          : "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30 ml-auto"
      )}
    >
      <div className={cn(
        "flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center shadow-sm",
        isAi 
          ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
          : "bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/50"
      )}>
        {isAi ? (
          <Bot className="h-4.5 w-4.5 text-white" />
        ) : (
          <User className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className={cn(
            "font-semibold text-sm",
            isAi 
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              : "text-blue-700 dark:text-blue-300"
          )}>
            {isAi ? "CLARA AI" : "You"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div 
          className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      </div>
    </motion.div>
  )
}

// Typing indicator component
const TypingIndicator = () => (
  <motion.div 
    className="flex items-center space-x-1 px-4 py-2"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div 
      className="h-2 w-2 rounded-full bg-primary/60"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
    />
    <motion.div 
      className="h-2 w-2 rounded-full bg-primary/60"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
    />
    <motion.div 
      className="h-2 w-2 rounded-full bg-primary/60"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
    />
  </motion.div>
);

export function DoctorChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Welcome to **MetaMedMD** — a clinical decision support system designed to standardize and optimize evidence-based care using our advanced CLARA AI system. How can I assist you with your clinical questions today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)


  // Auto-scroll to bottom when messages or streaming content changes
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, isLoading])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: "doctor",
      timestamp: new Date(),
    }

    // Clear input immediately
    const userMessage = inputMessage;
    setInputMessage("");
    
    // Add user message to chat
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/doctor/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let content = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          content += chunk;
          setStreamingContent(content);
        }
      }

      // After streaming is done, update the messages with the final response
      if (content.trim()) {
        setMessages(prev => {
          // Remove any existing streaming message
          const filtered = prev.filter(msg => msg.id !== 'streaming');
          // Add the final response
          return [
            ...filtered,
            {
              id: `ai-${Date.now()}`,
              content: content,
              sender: 'ai' as const,
              timestamp: new Date()
            }
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Sorry, there was an error processing your request. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingContent("");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userToken")
    window.location.href = "/login"
  }

  const displayMessages = useMemo(() => {
    if (isStreaming && streamingContent) {
      // Only show the streaming message if it's not empty
      if (streamingContent.trim()) {
        return [
          ...messages,
          {
            id: 'streaming',
            content: streamingContent,
            sender: 'ai' as const,
            timestamp: new Date()
          }
        ];
      }
    }
    return messages;
  }, [messages, isStreaming, streamingContent]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
      <Tabs defaultValue="chat" className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="container mx-auto">
            <div className="flex justify-between items-center p-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-3"
              >
                <Image
                  src="/MetamedMDlogo (2).png"
                  alt="MetaMedMD Logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  MetaMedMD
                </h1>
              </motion.div>
              
              <div className="flex items-center space-x-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="sr-only">Sign out</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Sign out</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            {/* Tabs */}
            <TabsList className="flex border-b border-gray-200 dark:border-slate-800 px-4">
              <TabsTrigger
                value="chat"
                className="flex items-center px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger
                value="evidence"
                className="flex items-center px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Evidence Engine
              </TabsTrigger>
            </TabsList>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full">
            <div className="h-full flex flex-col max-w-4xl mx-auto w-full">
              {/* Chat Area */}
              <ScrollArea 
                ref={scrollAreaRef}
                className="flex-1 p-4 overflow-y-auto"
              >
                <div className="space-y-6 pb-4">
                  <AnimatePresence initial={false}>
                    {displayMessages.map((message) => (
                      <MessageBubble 
                        key={message.id} 
                        message={message} 
                        isAi={message.sender === 'ai'}
                      />
                    ))}
                    
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TypingIndicator />
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </AnimatePresence>
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t border-gray-200 dark:border-slate-800 p-4">
                <div className="relative">
                  <Textarea
                    placeholder="Type your message..."
                    className="min-h-[60px] max-h-40 resize-none pr-12 text-base bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-gray-300/50 dark:border-slate-700/50 hover:border-blue-400/50 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all duration-200 shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="evidence" className="h-full">
            <div className="h-full">
              <EvidenceEngine />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
