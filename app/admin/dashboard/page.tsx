"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users, UserCheck, Activity, Settings, FileText, Plus, LogOut,
  Search, Edit2, Trash2, MessageSquare, ChevronLeft, ChevronRight,
  Shield, Eye, X, Save, AlertCircle, RefreshCw, Filter, Calendar
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getCookie } from "@/lib/cookies"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

// Types
interface BlogPost {
  id: string
  title: string
  content: string
  author: string
  date: string
  status: "published" | "draft"
}

interface UserStats {
  totalUsers: number
  activePatients: number
  activeDoctors: number
  chatSessions: number
}

interface User {
  id: string
  email: string
  role: "patient" | "doctor" | "admin"
  created_at: string
  last_login?: string
  full_name?: string
}

interface ChatSession {
  session_id: number | string
  session_name: string
  message_count: number
  created_at: string
  last_message_at: string | null
  user_id?: string
  session_type?: string
}

interface ChatMessage {
  message_id: number | string
  content: string
  role: string
  timestamp: string
}

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activePatients: 0,
    activeDoctors: 0,
    chatSessions: 0,
  })

  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [usersPage, setUsersPage] = useState(1)
  const [usersTotalPages, setUsersTotalPages] = useState(1)
  const [usersRoleFilter, setUsersRoleFilter] = useState<string>("all")
  const [usersSearchQuery, setUsersSearchQuery] = useState("")
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [newRole, setNewRole] = useState<string>("")

  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [sessionsFilter, setSessionsFilter] = useState<string>("all")
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [showMessagesDialog, setShowMessagesDialog] = useState(false)

  // Blog posts state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [newPost, setNewPost] = useState({ title: "", content: "" })
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()
  const router = useRouter()

  // Fetch user statistics
  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/proxy/admin/users`)
      const data = await response.json()
      if (response.ok) {
        setUserStats({
          totalUsers: data.totalUsers ?? 0,
          activePatients: data.activePatients ?? 0,
          activeDoctors: data.activeDoctors ?? 0,
          chatSessions: data.chatSessions ?? 0,
        })
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error)
    }
  }, [])

  // Fetch users with pagination and filter
  const fetchUsers = useCallback(async (page: number = 1, roleFilter: string = "all") => {
    setIsLoadingUsers(true)
    try {
      let url = `/api/proxy/admin/users?page=${page}&limit=20`
      if (roleFilter !== "all") {
        url += `&role_filter=${roleFilter}`
      }
      const response = await fetch(url)
      const data = await response.json()
      if (response.ok) {
        setUsers(data.users || [])
        setUsersTotalPages(data.total_pages || 1)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setIsLoadingUsers(false)
    }
  }, [toast])

  // Change user role
  const handleChangeUserRole = async () => {
    if (!selectedUser || !newRole) return

    try {
      const response = await fetch(`/api/proxy/admin/users/${selectedUser.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `User role updated to ${newRole}`,
        })
        setShowRoleDialog(false)
        setSelectedUser(null)
        setNewRole("")
        fetchUsers(usersPage, usersRoleFilter)
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to update role")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive",
      })
    }
  }

  // Fetch chat sessions
  const fetchSessions = useCallback(async (sessionType: string = "all", userId?: string) => {
    setIsLoadingSessions(true)
    try {
      let url = `/api/proxy/admin/sessions?`
      if (sessionType !== "all") {
        url += `session_type=${sessionType}&`
      }
      if (userId) {
        url += `user_id=${userId}`
      }
      const response = await fetch(url)
      const data = await response.json()
      if (response.ok) {
        const sessionData = data.sessions || data
        setSessions(Array.isArray(sessionData) ? sessionData : [])
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
    } finally {
      setIsLoadingSessions(false)
    }
  }, [])

  // Fetch session messages
  const fetchSessionMessages = async (sessionId: number | string) => {
    setIsLoadingMessages(true)
    try {
      const response = await fetch(`/api/proxy/admin/sessions/${sessionId}/messages`)
      const data = await response.json()
      if (response.ok) {
        const msgData = data.messages || data
        setSessionMessages(Array.isArray(msgData) ? msgData : [])
      }
    } catch (error) {
      console.error("Failed to fetch session messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Fetch blog posts
  const fetchBlogPosts = useCallback(async () => {
    try {
      const response = await fetch(`/api/proxy/admin/articles`)
      const data = await response.json()
      if (response.ok) {
        setBlogPosts(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Failed to fetch blog posts:", error)
    }
  }, [])

  // Create blog post
  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) {
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/proxy/admin/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          author: "Admin"
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const savedPost = await response.json()
      setBlogPosts(prev => [...prev, savedPost])
      setNewPost({ title: "", content: "" })

      toast({
        title: "Success",
        description: "Article created successfully",
      })
    } catch (error) {
      console.error("Failed to create blog post:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create article",
        variant: "destructive",
      })
    }
  }

  // Edit blog post
  const handleEditPost = async () => {
    if (!editingPost) return

    try {
      const response = await fetch(`/api/proxy/admin/articles/${editingPost.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingPost.title,
          content: editingPost.content,
          status: editingPost.status
        }),
      })

      if (response.ok) {
        const updatedPost = await response.json()
        setBlogPosts(blogPosts.map(p => p.id === editingPost.id ? updatedPost : p))
        setShowEditDialog(false)
        setEditingPost(null)
        toast({
          title: "Success",
          description: "Article updated successfully",
        })
      } else {
        throw new Error("Failed to update article")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update article",
        variant: "destructive",
      })
    }
  }

  // Delete blog post
  const handleDeletePost = async () => {
    if (!postToDelete) return

    try {
      const response = await fetch(`/api/proxy/admin/articles/${postToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setBlogPosts(blogPosts.filter(p => p.id !== postToDelete.id))
        setShowDeleteDialog(false)
        setPostToDelete(null)
        toast({
          title: "Success",
          description: "Article deleted successfully",
        })
      } else {
        throw new Error("Failed to delete article")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      })
    }
  }

  // Document upload
  const handleDocUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append("documents", file)
    })

    try {
      const response = await fetch("/api/proxy/admin/upload-docs", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: `Successfully uploaded ${result.uploadedFiles?.length || 0} document(s)`,
        })
      }
    } catch (error) {
      console.error("Failed to upload documents:", error)
      toast({
        title: "Error",
        description: "Failed to upload documents",
        variant: "destructive",
      })
    } finally {
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    localStorage.clear()
    router.push("/login")
  }

  useEffect(() => {
    const userRole = getCookie('clientRole')
    if (userRole !== 'admin') {
      router.push('/login')
      return
    }

    setIsAuthenticated(true)

    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([fetchUserStats(), fetchBlogPosts()])
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, fetchUserStats, fetchBlogPosts])

  // Load users when switching to users tab
  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers(usersPage, usersRoleFilter)
    }
  }, [activeTab, usersPage, usersRoleFilter, fetchUsers])

  // Load sessions when switching to sessions tab
  useEffect(() => {
    if (activeTab === "sessions") {
      fetchSessions(sessionsFilter)
    }
  }, [activeTab, sessionsFilter, fetchSessions])

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-700 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-slate-400 text-lg font-medium animate-pulse">
          {isLoading ? "Loading dashboard..." : "Verifying access..."}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0F172A] via-[#0A0F1C] to-[#0F172A]" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-slate-400 text-sm">Manage your healthcare platform</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all duration-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-900/50 border border-slate-800 p-1 rounded-xl">
            {[
              { value: "overview", label: "Overview", icon: Activity },
              { value: "users", label: "Users", icon: Users },
              { value: "sessions", label: "Sessions", icon: MessageSquare },
              { value: "articles", label: "Articles", icon: FileText },
              { value: "documents", label: "Documents", icon: Settings },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-400 data-[state=active]:border-teal-500/30 text-slate-400 hover:text-slate-200 transition-all duration-200 flex items-center gap-2 border border-transparent rounded-lg"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {[
                { title: "Total Users", value: userStats.totalUsers, icon: Users, color: "blue", gradient: "from-blue-500 to-blue-600" },
                { title: "Active Patients", value: userStats.activePatients, icon: Activity, color: "green", gradient: "from-emerald-500 to-emerald-600" },
                { title: "Active Doctors", value: userStats.activeDoctors, icon: UserCheck, color: "teal", gradient: "from-teal-500 to-teal-600" },
                { title: "Chat Sessions", value: userStats.chatSessions, icon: MessageSquare, color: "purple", gradient: "from-purple-500 to-purple-600" },
              ].map((stat, index) => (
                <motion.div key={stat.title} variants={fadeInUp}>
                  <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-300 overflow-hidden group">
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300", stat.gradient)} />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-slate-400">{stat.title}</CardTitle>
                      <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", stat.gradient)}>
                        <stat.icon className="h-5 w-5 text-white" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">
                        {stat.value.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <motion.div {...fadeInUp}>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-teal-400" />
                        User Management
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        View and manage platform users
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select value={usersRoleFilter} onValueChange={setUsersRoleFilter}>
                        <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700 text-slate-200">
                          <Filter className="w-4 h-4 mr-2 text-slate-400" />
                          <SelectValue placeholder="Filter Role" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="patient">Patient</SelectItem>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fetchUsers(usersPage, usersRoleFilter)}
                        className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400"
                      >
                        <RefreshCw className={cn("w-4 h-4", isLoadingUsers && "animate-spin")} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-slate-800 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-800 hover:bg-transparent">
                          <TableHead className="text-slate-400">User</TableHead>
                          <TableHead className="text-slate-400">Email</TableHead>
                          <TableHead className="text-slate-400">Role</TableHead>
                          <TableHead className="text-slate-400">Joined</TableHead>
                          <TableHead className="text-slate-400 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingUsers ? (
                          [...Array(5)].map((_, i) => (
                            <TableRow key={i} className="border-slate-800">
                              <TableCell colSpan={5}>
                                <div className="h-10 bg-slate-800 rounded animate-pulse" />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : !Array.isArray(users) || users.length === 0 ? (
                          <TableRow className="border-slate-800">
                            <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                              No users found
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((user) => (
                            <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                              <TableCell className="text-slate-200 font-medium">
                                {user.full_name || "—"}
                              </TableCell>
                              <TableCell className="text-slate-400">{user.email}</TableCell>
                              <TableCell>
                                <Badge
                                  className={cn(
                                    "capitalize",
                                    user.role === "admin" && "bg-purple-500/20 text-purple-400 border border-purple-500/30",
                                    user.role === "doctor" && "bg-teal-500/20 text-teal-400 border border-teal-500/30",
                                    user.role === "patient" && "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                  )}
                                >
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-500 text-sm">
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setNewRole(user.role)
                                    setShowRoleDialog(true)
                                  }}
                                  className="text-slate-400 hover:text-teal-400 hover:bg-teal-500/10"
                                >
                                  <Edit2 className="w-4 h-4 mr-1" />
                                  Change Role
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-slate-500">
                      Page {usersPage} of {usersTotalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={usersPage === 1}
                        onClick={() => setUsersPage(p => p - 1)}
                        className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-50"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={usersPage === usersTotalPages}
                        onClick={() => setUsersPage(p => p + 1)}
                        className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-50"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <motion.div {...fadeInUp}>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-teal-400" />
                        Chat Session Logs
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        View and monitor chat sessions
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select value={sessionsFilter} onValueChange={setSessionsFilter}>
                        <SelectTrigger className="w-[160px] bg-slate-800 border-slate-700 text-slate-200">
                          <Filter className="w-4 h-4 mr-2 text-slate-400" />
                          <SelectValue placeholder="Session Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          <SelectItem value="all">All Sessions</SelectItem>
                          <SelectItem value="patient">Patient Sessions</SelectItem>
                          <SelectItem value="doctor">Doctor Sessions</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fetchSessions(sessionsFilter)}
                        className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400"
                      >
                        <RefreshCw className={cn("w-4 h-4", isLoadingSessions && "animate-spin")} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {isLoadingSessions ? (
                      [...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 bg-slate-800 rounded-lg animate-pulse" />
                      ))
                    ) : !Array.isArray(sessions) || sessions.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No sessions found</p>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {sessions.map((session) => (
                          <motion.div
                            key={session.session_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-teal-500/30 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-white font-medium">
                                    {session.session_name || `Session ${session.session_id}`}
                                  </h4>
                                  <Badge className="bg-slate-700 text-slate-300">
                                    ID: {session.session_id}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="w-4 h-4" />
                                    {session.message_count} messages
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(session.created_at).toLocaleDateString()}
                                  </span>
                                  {session.session_type && (
                                    <Badge className="bg-teal-500/20 text-teal-400">
                                      {session.session_type}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSession(session)
                                  setShowMessagesDialog(true)
                                  fetchSessionMessages(session.session_id)
                                }}
                                className="border-slate-600 bg-slate-700 hover:bg-teal-500/10 hover:border-teal-500/50 text-slate-300 hover:text-teal-400"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Messages
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Article */}
              <motion.div {...fadeInUp}>
                <Card className="bg-slate-900/50 border-slate-800 h-full">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Plus className="w-5 h-5 text-teal-400" />
                      Create New Article
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Write health articles for patients
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Title</Label>
                      <Input
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        placeholder="Enter article title"
                        className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Content</Label>
                      <Textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        placeholder="Write your article content..."
                        rows={8}
                        className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-teal-500 focus:ring-teal-500/20 resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleCreatePost}
                      className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/20"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Publish Article
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Articles List */}
              <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                <Card className="bg-slate-900/50 border-slate-800 h-full">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-teal-400" />
                      Published Articles ({blogPosts?.length || 0})
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Manage existing articles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {!Array.isArray(blogPosts) || blogPosts.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No articles yet</p>
                          </div>
                        ) : (
                          blogPosts.map((post) => (
                            <div
                              key={post.id}
                              className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-all duration-200 group"
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <h4 className="font-medium text-slate-200 flex-1">{post.title}</h4>
                                <Badge
                                  className={cn(
                                    post.status === "published"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-amber-500/20 text-amber-400"
                                  )}
                                >
                                  {post.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 mb-2">
                                By {post.author} • {post.date}
                              </p>
                              <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                                {post.content.substring(0, 120)}...
                              </p>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingPost(post)
                                    setShowEditDialog(true)
                                  }}
                                  className="text-slate-400 hover:text-teal-400 hover:bg-teal-500/10"
                                >
                                  <Edit2 className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setPostToDelete(post)
                                    setShowDeleteDialog(true)
                                  }}
                                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <motion.div {...fadeInUp}>
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-teal-400" />
                    Document Management
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Upload and manage medical documents for RAG
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-teal-500/50 transition-colors duration-300">
                    <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-teal-400" />
                    </div>
                    <Label htmlFor="doc-upload" className="cursor-pointer">
                      <span className="text-slate-200 font-medium">Click to upload documents</span>
                      <p className="text-sm text-slate-500 mt-1">PDF, DOC, DOCX, or TXT files</p>
                    </Label>
                    <Input
                      id="doc-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleDocUpload}
                      className="hidden"
                    />
                    <Button variant="outline" className="mt-4 border-slate-700 bg-slate-800 hover:bg-teal-500/10 hover:border-teal-500/50 text-slate-300">
                      <Plus className="w-4 h-4 mr-2" />
                      Select Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-400" />
              Change User Role
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the role for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="text-slate-300 mb-2 block">Select New Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRoleDialog(false)}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeUserRole}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Messages Dialog */}
      <Dialog open={showMessagesDialog} onOpenChange={setShowMessagesDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-400" />
              Session Messages
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedSession?.session_name || `Session ${selectedSession?.session_id}`}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            {isLoadingMessages ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-800 rounded animate-pulse" />
                ))}
              </div>
            ) : !Array.isArray(sessionMessages) || sessionMessages.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages in this session</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessionMessages.map((msg) => (
                  <div
                    key={msg.message_id}
                    className={cn(
                      "p-4 rounded-xl",
                      msg.role === "user" || msg.role === "patient" || msg.role === "doctor"
                        ? "bg-teal-500/10 border border-teal-500/20 ml-8"
                        : "bg-slate-800 border border-slate-700 mr-8"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={cn(
                        "uppercase text-xs",
                        msg.role === "user" || msg.role === "patient" ? "bg-teal-500/20 text-teal-400" :
                          msg.role === "doctor" ? "bg-blue-500/20 text-blue-400" :
                            "bg-purple-500/20 text-purple-400"
                      )}>
                        {msg.role}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button
              onClick={() => setShowMessagesDialog(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-teal-400" />
              Edit Article
            </DialogTitle>
          </DialogHeader>
          {editingPost && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-slate-300">Title</Label>
                <Input
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-slate-200 focus:border-teal-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Content</Label>
                <Textarea
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  rows={6}
                  className="bg-slate-800 border-slate-700 text-slate-200 focus:border-teal-500 resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Status</Label>
                <Select
                  value={editingPost.status}
                  onValueChange={(v) => setEditingPost({ ...editingPost, status: v as "published" | "draft" })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditPost}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              Delete Article
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete &quot;{postToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeletePost}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
