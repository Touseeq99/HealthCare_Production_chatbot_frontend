"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/date-utils"
import { LogOut, Send, Bot, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

export function DoctorChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello Doctor! I'm your AI medical assistant. I can help you with medical queries, research, and clinical guidance. How can I assist you today?",
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

  function formatMessageContent(content: string) {
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
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, isLoading])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "doctor",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputMessage("")
    setIsLoading(true)
    setIsStreaming(true)
    setStreamingContent('')

    // Create a temporary bot message that will be updated with the stream
    const tempBotMessage: Message = {
      id: `temp-${Date.now()}`,
      content: '',
      sender: 'ai',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, tempBotMessage]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/doctor/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage
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
          
          // Update the streaming content and the last message
          setStreamingContent(content);
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.id === tempBotMessage.id) {
              return [
                ...newMessages.slice(0, -1),
                { ...lastMessage, content }
              ];
            }
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error('Error during streaming:', error);
      // Fallback to non-streaming response on error
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, but I'm unable to process your message at this time. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev.filter(m => m.id !== tempBotMessage.id), botResponse]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingContent('');
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userToken")
    window.location.href = "/login"
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] bg-white rounded-xl border border-red-100 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-white text-xl">CardioCare AI</h2>
            <p className="text-red-100 text-sm flex items-center">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Online - 24/7 Cardiac Support
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleLogout}
                  className="text-white/90 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-red-50 to-red-50 relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center opacity-5"></div>
        <ScrollArea ref={scrollAreaRef} className="h-full w-full p-6 relative z-10">
          <div className="space-y-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-4 group",
                  message.sender === "doctor" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center mt-1 flex-shrink-0 shadow-sm",
                  message.sender === "doctor" 
                    ? "bg-red-600 text-white" 
                    : "bg-white text-red-600 border-2 border-red-100"
                )}>
                  {message.sender === "doctor" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-5 py-4 shadow-sm relative transition-all duration-200",
                    message.sender === "doctor"
                      ? "bg-red-600 text-white rounded-br-none shadow-red-100"
                      : "bg-white text-gray-800 rounded-bl-none border border-red-50 shadow-sm"
                  )}
                >
                  <div 
                    className={cn("prose prose-sm max-w-none", message.sender === "doctor" ? "text-white" : "text-gray-700")}
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageContent(message.content) 
                    }} 
                  />
                  <div className={cn(
                    "text-xs mt-3 flex items-center justify-end gap-1.5",
                    message.sender === "doctor" ? "text-red-100" : "text-gray-400"
                  )}>
                    {formatTime(message.timestamp)}
                    {message.sender === "ai" && (
                      <span className="text-red-300">•</span>
                    )}
                    {message.sender === "ai" && (
                      <span className="text-red-300">AI Assistant</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-white border-2 border-red-100 flex items-center justify-center mt-1 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="max-w-[75%] rounded-2xl rounded-tl-none bg-white px-5 py-4 shadow-sm border border-red-50">
                  <div 
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageContent(streamingContent) 
                    }} 
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-red-100 bg-white/90 backdrop-blur-sm relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-red-100 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-red-600 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>CardioCare AI Assistant</span>
          </div>
        </div>
        <div className="relative">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your medical query..."
            className="min-h-[60px] max-h-[200px] pr-24 resize-none border-red-200 focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all duration-200 text-base"
            onKeyDown={async (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                if (inputMessage.trim()) {
                  await handleSendMessage()
                }
              }
            }}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-red-50 transition-colors text-gray-500 hover:text-red-500"
                  onClick={() => {
                    const heart = '❤️';
                    setInputMessage(prev => prev.endsWith(heart) ? prev : prev + ' ' + heart);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add Heart</p>
              </TooltipContent>
            </Tooltip>
            <Button 
              type="submit" 
              size="sm"
              disabled={!inputMessage.trim() || isLoading}
              className="h-10 w-10 p-0 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg"
              onClick={handleSendMessage}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
