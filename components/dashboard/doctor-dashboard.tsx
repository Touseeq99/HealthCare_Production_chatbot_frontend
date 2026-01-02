"use client"

import { DoctorChatInterface } from "@/components/chat/doctor-chat-interface"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function DoctorDashboard() {
  const router = useRouter()


  return (

    <div className="flex-1">
      <DoctorChatInterface />
    </div>
  )
}
