"use client"

import { DoctorChatInterface } from "@/components/chat/doctor-chat-interface"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function DoctorDashboard() {
  const router = useRouter()

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("userToken")
    
    // Clear cookies
    document.cookie = "userToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "userEmail=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    
    router.push("/login")
  }

  return (

      <div className="flex-1">
        <DoctorChatInterface />
      </div>
  )
}
