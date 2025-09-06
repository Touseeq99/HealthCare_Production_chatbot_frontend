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
    <div className="flex flex-col h-[calc(100vh-80px)] max-h-[calc(100vh-80px)] bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b p-4 bg-white flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Bot className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">AI Medical Assistant</h2>
            <p className="text-xs text-gray-500">Always available</p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="text-gray-500 hover:bg-gray-100 hover:text-gray-700"
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

      {/* Messages */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-full w-full p-4"
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.sender === "doctor" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={message.sender === "doctor" ? "/doctor-avatar.png" : "/ai-avatar.png"} />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {message.sender === "doctor" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                    message.sender === "doctor"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                  )}
                >
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageContent(message.content) 
                    }} 
                  />
                  <div className={cn(
                    "text-xs mt-1.5 flex items-center justify-end",
                    message.sender === "doctor" ? "text-blue-100" : "text-gray-400"
                  )}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isStreaming && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src="/ai-avatar.png" />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] rounded-2xl rounded-tl-none bg-white px-4 py-2.5 shadow-sm border border-gray-200">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageContent(streamingContent) 
                    }} 
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 justify-end">
                    <span className="text-xs text-gray-400">typing</span>
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            await handleSendMessage()
          }}
          className="relative"
        >
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[56px] max-h-[200px] pr-12 resize-none"
            onKeyDown={async (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                await handleSendMessage()
              }
            }}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!inputMessage.trim() || isLoading}
            className="absolute right-2 bottom-2 h-9 w-9 rounded-full"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
          
          {isLoading && (
            <div className="absolute -top-6 left-0 right-0 flex justify-center">
              <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm border border-gray-200">
                <span>AI is thinking</span>
                <div className="flex space-x-0.5">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
