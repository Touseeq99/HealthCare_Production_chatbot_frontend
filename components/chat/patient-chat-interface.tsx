"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/ui/copy-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatTime } from "@/lib/date-utils"
import { BookOpen, MessageCircle, Calendar, User } from "lucide-react"

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
        "Hello! I'm your friendly assistant. I'm here to provide educational information about heart health and general wellness. How are you feeling today?",
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
  const [streamingContent, setStreamingContent] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const quickSuggestions = [
    "Tell me about heart-healthy foods",
    "What are signs of high blood pressure?",
    "How can I improve my cardiovascular health?",
    "What should I know about chest pain?",
  ]


  useEffect(() => {
    fetchBlogPosts()
  }, [])

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
  }, [messages, streamingContent, isTyping, scrollToBottom])

  const fetchBlogPosts = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/articles`;
      console.log('Fetching from URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          url: apiUrl
        });
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const posts = await response.json();
      setBlogPosts(posts);
    } catch (error) {
      console.error("Failed to fetch blog posts:", error)
      const savedPosts = localStorage.getItem("blogPosts")
      if (savedPosts) {
        setBlogPosts(JSON.parse(savedPosts))
      }
    }
  }

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputMessage
    if (!messageToSend.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputMessage("")
    setIsTyping(true)
    setIsLoading(true)
    setIsStreaming(true)
    setStreamingContent('')

    // Create a temporary bot message that will be updated with the stream
    const tempBotMessage: Message = {
      id: `temp-${Date.now()}`,
      content: '',
      sender: 'bot' as const,
      timestamp: new Date(),
      type: 'text',
    };
    
    setMessages(prev => [...prev, tempBotMessage]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/patient/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend
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

      // Once streaming is complete, we can add any additional processing here
 
    } catch (error) {
      console.error('Error during streaming:', error);
      // Fallback to non-streaming response on error
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, but I'm unable to process your message at this time. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      };
      setMessages(prev => [...prev.filter(m => m.id !== tempBotMessage.id), botResponse]);
    } finally {
      setIsTyping(false);
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

  const handleReadMore = (article: BlogPost) => {
    setSelectedArticle(article)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedArticle(null)
  }

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col">
      <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-4 flex flex-col items-center">
        <h2 className="font-bold text-blue-800 text-xl">Patient Chat</h2>
        <p className="text-blue-700 text-sm font-semibold">Smarter Care, Simpler Things</p>
      </div>
      <div className="flex-1">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <div className="bg-blue-50/50 backdrop-blur-sm border-b border-blue-200/30 px-4">
            <div className="max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 bg-transparent">
                <TabsTrigger value="chat" className="flex items-center gap-2 text-blue-700 data-[state=active]:text-blue-800 data-[state=active]:bg-blue-100">
                  <MessageCircle className="h-4 w-4" />
                  💬 Chat Assistant
                </TabsTrigger>
                <TabsTrigger value="blog" className="flex items-center gap-2 text-blue-700 data-[state=active]:text-blue-800 data-[state=active]:bg-blue-100">
                  <BookOpen className="h-4 w-4" />
                  📚 Health Articles ({blogPosts.length})
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="flex items-start gap-3 max-w-lg group">
                      {message.sender === "bot" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-200/30 to-blue-300/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
                          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm min-w-[80px] ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                            : message.type === "health-tip"
                              ? "bg-gradient-to-r from-blue-100/80 to-blue-200/80 border border-blue-200/50 text-blue-900 rounded-bl-md"
                              : "bg-white/90 backdrop-blur-sm border border-blue-200/30 text-gray-800 rounded-bl-md"
                        }`}
                      >
                        {message.type === "health-tip" ? (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                              <span className="text-xs font-medium text-blue-800">💡 Health Tip</span>
                            </div>
                            <div 
                              className="text-sm leading-relaxed text-black [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul>li]:mb-1 [&_strong]:font-semibold"
                              dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                            />
                          </>
                        ) : message.sender === 'bot' && message.id.startsWith('temp-') && !message.content ? (
                          <div className="h-5 flex items-center">
                            <span className="inline-block w-2 h-5 bg-blue-500 animate-pulse"></span>
                          </div>
                        ) : (
                          <div 
                            className={`text-sm leading-relaxed ${message.sender === "user" ? "text-white" : "text-black"} [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul>li]:mb-1 [&_strong]:font-semibold`}
                            dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                          />
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p
                            className={`text-xs opacity-70 ${message.sender === "user" ? "text-white" : "text-gray-600"}`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                          {message.sender === "bot" && (
                            <CopyButton 
                              text={message.content} 
                              size="sm" 
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          )}
                        </div>
                      </div>
                      {message.sender === "user" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-200/30 to-blue-300/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <div className="max-w-4xl mx-auto">
                  <p className="text-sm text-gray-600 mb-3 text-center">Try asking about:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendMessage(suggestion)}
                        className="bg-blue-100/50 hover:bg-blue-200/70 border-blue-200/50 text-blue-800 hover:text-blue-900 rounded-full"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-50/90 to-blue-100/90 backdrop-blur-sm border-t border-blue-200/30 p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-3">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me about heart health, symptoms, or wellness tips..."
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="bg-background/80 backdrop-blur-sm border-border/50 rounded-full px-4 text-black placeholder:text-gray-500"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full px-6 text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </Button>
                </div>
                <div className="flex items-center justify-center mt-3">
                  <Card className="bg-accent/10 border-accent/20">
                    <CardContent className="p-3">
                      <p className="text-xs text-center text-black">
                        <strong>Important:</strong> This is for educational purposes only. Always consult your doctor
                        for medical advice.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="blog" className="flex-1 mt-0">
            <ScrollArea className="h-full p-4 max-h-[calc(100vh-150px)] overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-black mb-2">Health Articles & Tips</h2>
                  <p className="text-gray-600">Educational content from our medical team</p>
                </div>

                {blogPosts.length > 0 ? (
                  <div className="grid gap-6">
                    {blogPosts.map((post) => (
                      <Card
                        key={post.id}
                        className="bg-card/90 backdrop-blur-sm border border-border/30 hover:shadow-lg transition-all duration-200"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <CardTitle 
                                className="text-lg text-black hover:text-blue-600 transition-colors cursor-pointer"
                                onClick={() => handleReadMore(post)}
                              >
                                {post.title}
                              </CardTitle>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>By ADMIN</span>
                                <span>•</span>
                                <span>{post.date}</span>
                                <Badge variant="secondary" className="bg-secondary/50 text-black">
                                  {post.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-black leading-relaxed">
                            {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                          </p>
                          {post.content.length > 200 && (
                            <Button 
                              variant="link" 
                              className="p-0 h-auto mt-2 text-blue-600 hover:text-blue-800"
                              onClick={() => handleReadMore(post)}
                            >
                              Read more
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-black mb-2">No Articles Yet</h3>
                    <p className="text-gray-600">
                      Our medical team is working on creating helpful health articles for you. Check back soon!
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Article Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black mb-2">
              {selectedArticle?.title}
            </DialogTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>By {selectedArticle?.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{selectedArticle?.date}</span>
              </div>
              <Badge variant="secondary" className="bg-secondary/50 text-black">
                {selectedArticle?.status}
              </Badge>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="prose prose-gray max-w-none">
              <p className="text-black leading-relaxed whitespace-pre-wrap">
                {selectedArticle?.content}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-gray-600">Health Article</span>
              </div>
              <CopyButton 
                text={selectedArticle?.content || ''} 
                size="sm" 
                variant="outline"
                showText={true}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes gentle-heartbeat {
          0%, 100% { opacity: 0.2; transform: scaleY(1); }
          50% { opacity: 0.6; transform: scaleY(1.1); }
        }
        
        @keyframes heartbeat-pulse {
          0%, 100% { 
            opacity: 0.3; 
            transform: scaleX(1); 
            stroke-width: 2;
          }
          25% { 
            opacity: 0.8; 
            transform: scaleX(1.1); 
            stroke-width: 3;
          }
          50% { 
            opacity: 0.5; 
            transform: scaleX(0.9); 
            stroke-width: 2;
          }
          75% { 
            opacity: 0.9; 
            transform: scaleX(1.05); 
            stroke-width: 3;
          }
        }
        
        @keyframes heart-glow {
          0%, 100% { 
            filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.3));
            transform: scale(1);
          }
          50% { 
            filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.6));
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )

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