import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/date-utils"
import { LogOut, Send, Bot, User, Loader2, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image";

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
  const variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: { opacity: 0, x: isAi ? -20 : 20, scale: 0.95 }
  };

  return (
    <motion.div
      className={cn(
        "flex mb-4",
        isAi ? "justify-start" : "justify-end"
      )}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      layout
    >
      <div className={cn(
        "flex max-w-[85%] md:max-w-[75%] lg:max-w-[65%] xl:max-w-[55%]",
        isAi ? "flex-row" : "flex-row-reverse"
      )}>
        <div className={cn(
          "flex-shrink-0",
          isAi ? "mr-3" : "ml-3"
        )}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={isAi ? "/ai-avatar.png" : "/doctor-avatar.png"} />
            <AvatarFallback className={cn(
              "text-sm font-medium",
              isAi ? "bg-blue-100 text-blue-800" : "bg-primary text-white"
            )}>
              {isAi ? "AI" : "DR"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className={cn(
          "rounded-2xl px-4 py-2 text-sm",
          isAi 
            ? "bg-white border border-gray-200 shadow-sm text-gray-800" 
            : "bg-primary text-white"
        )}>
          <div 
            className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5"
            dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
          />
          <div className={cn(
            "text-xs mt-1 flex justify-end",
            isAi ? "text-gray-500" : "text-white/80"
          )}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

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
      content: "Welcome to MetaMed — a clinical decision support system designed to standardize and optimize evidence-based care using an advanced highly accurate system called CLARA. Please enter your clinical question.",
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
      id: Date.now().toString(),
      content: inputMessage,
      sender: "doctor",
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage("")
    setIsLoading(true)
    setIsStreaming(true)
    setStreamingContent("")

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
          // Update the streaming content with the latest chunk
          setStreamingContent(content);
        }
      }

      // After streaming is done, add the complete message to messages
      if (content.trim()) {
        const botResponse: Message = {
          id: `ai-${Date.now()}`,
          content: content,
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botResponse]);
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
    return messages;
  }, [messages, isStreaming, streamingContent]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <motion.header 
        className="border-b bg-white shadow-sm z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-shrink-0">
              <Image 
                src="/MetamedMDlogo (2).png" 
                alt="MetaMed Logo" 
                width={40} 
                height={40}
                className="rounded-md object-contain"
                priority
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Doctor Chat</h2>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-5 w-5 text-gray-700" />
                    <span className="sr-only">End Session</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>End Session</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </motion.header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 p-4 overflow-y-auto"
        >
          <div className="space-y-4 pb-4">
            <AnimatePresence initial={false}>
              {displayMessages.map((message, index) => (
                <MessageBubble 
                  key={message.id + index} 
                  message={message} 
                  isAi={message.sender === 'ai'}
                />
              ))}
              {(isLoading || isStreaming) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start"
                > 
                  <div className="flex-shrink-0 mr-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/ai-avatar.png" />
                      <AvatarFallback className="bg-blue-100 text-blue-800 text-sm font-medium">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t bg-white px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="relative">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message here..."
            className="min-h-[60px] max-h-32 pr-12 resize-none border-gray-300 focus-visible:ring-2 focus-visible:ring-primary/50 text-gray-900 placeholder:text-gray-400"
            rows={1}
          />
          <motion.div 
            className="absolute right-2 bottom-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="h-9 w-9 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
