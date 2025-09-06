"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserCheck, Activity, Settings, FileText, Plus, LogOut } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activePatients: 0,
    activeDoctors: 0,
    chatSessions: 0,
  })
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [newPost, setNewPost] = useState({ title: "", content: "" })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`)
      const data = await response.json()
      if (response.ok) {
        setUserStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch user stats:", error)
    }
  }

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/articles`)
      const data = await response.json()
      if (response.ok) {
        setBlogPosts(data)
      }
    } catch (error) {
      console.error("Failed to fetch blog posts:", error)
    }
  }


  useEffect(() => {
    // Check for auth in both cookie and localStorage
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    // Check both cookie and localStorage for token
    const cookieToken = getCookie('auth-token');
    const localStorageToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    const isAuth = localStorage.getItem('isAuthenticated');

    console.log('Auth check:', { 
      cookieToken: !!cookieToken, 
      localStorageToken: !!localStorageToken, 
      userRole, 
      isAuth 
    });

    if ((!cookieToken && !localStorageToken) || userRole !== 'admin' || isAuth !== 'true') {
      console.log('Redirecting to login - missing auth');
      router.push('/login');
      return;
    }

    console.log('Authentication successful, loading dashboard');
    setIsAuthenticated(true);

    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchUserStats(), fetchBlogPosts()]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Clear auth and redirect to login on error
        document.cookie = 'auth-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) {
      console.error('Validation failed: Title and content are required');
      toast({
        title: "Error",
        description: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Sending request to create article:', {
        url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/articles`,
        method: "POST",
        body: {
          title: newPost.title,
          content: newPost.content,
          author: "Admin"
        }
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          author: "Admin"
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedPost = await response.json();
      console.log('Article created successfully:', savedPost);
      setBlogPosts([...blogPosts, savedPost]);
      setNewPost({ title: "", content: "" });
      
      toast({
        title: "Success",
        description: "Article created successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Failed to create blog post:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create article. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleDocUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append("documents", file)
    })

    try {
      const response = await fetch("/api/admin/upload-docs", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: `Successfully uploaded ${result.uploadedFiles.length} document(s)`,
          variant: "default",
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
      // Reset the file input
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-black">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-red-800">❤️ Admin Dashboard</h1>
            <p className="text-gray-600">Manage healthcare platform</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-black border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-10">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="overview" className="text-black hover:bg-blue-50">
              Overview
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-black hover:bg-blue-50">
              Documents
            </TabsTrigger>
            <TabsTrigger value="blog" className="text-black hover:bg-blue-50">
              Blog Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-black">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">{userStats.totalUsers.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-black">Active Patient</CardTitle>
                  <Activity className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">{userStats.activePatients.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-black">Active Doctors</CardTitle>
                  <UserCheck className="h-4 w-4 text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">{userStats.activeDoctors}</div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-black">Chat Sessions</CardTitle>
                  <Settings className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-black">{userStats.chatSessions.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Document Management</CardTitle>
                <CardDescription className="text-gray-600">Upload and manage medical documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="doc-upload" className="text-black">
                      Upload New Documents
                    </Label>
                    <Input
                      id="doc-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleDocUpload}
                      className="mt-2 text-black hover:bg-blue-50"
                    />
                  </div>

          
                </div>
              </CardContent>
            </Card>

 
          </TabsContent>

          <TabsContent value="blog" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-black">Create New Blog Post</CardTitle>
                  <CardDescription className="text-gray-600">Write health articles for patients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="post-title" className="text-black">
                        Title
                      </Label>
                      <Input
                        id="post-title"
                        value={newPost.title}
                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        placeholder="Enter blog post title"
                        className="text-black placeholder:text-gray-500 hover:bg-blue-50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="post-content" className="text-black">
                        Content
                      </Label>
                      <Textarea
                        id="post-content"
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        placeholder="Write your blog post content here..."
                        rows={8}
                        className="text-black placeholder:text-gray-500 hover:bg-blue-50"
                      />
                    </div>
                    <Button onClick={handleCreatePost} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Publish Post
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-black">Published Posts ({blogPosts.length})</CardTitle>
                  <CardDescription className="text-gray-600">Manage existing blog posts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {blogPosts.length > 0 ? (
                      blogPosts.map((post) => (
                        <div key={post.id} className="p-3 border rounded space-y-2 hover:bg-blue-50">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-black">{post.title}</h4>
                            <Badge variant="secondary" className="text-black">
                              {post.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            By {post.author} • {post.date}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">{post.content.substring(0, 100)}...</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-sm">No blog posts yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
