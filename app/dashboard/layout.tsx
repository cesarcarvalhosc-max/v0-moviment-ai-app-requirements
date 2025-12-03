import type React from "react"
import { NotificationPrompt } from "@/components/notification-prompt"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <NotificationPrompt />
    </>
  )
}
