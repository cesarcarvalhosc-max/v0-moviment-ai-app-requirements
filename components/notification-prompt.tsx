"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Bell } from "lucide-react"
import { requestNotificationPermission } from "@/lib/notifications"

export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Show prompt on first app open
    const hasPrompted = localStorage.getItem("movimentai_notification_prompted")

    if (!hasPrompted && "Notification" in window && Notification.permission === "default") {
      // Delay to show after initial load
      setTimeout(() => {
        setShowPrompt(true)
      }, 2000)
    }
  }, [])

  const handleEnable = async () => {
    const granted = await requestNotificationPermission()
    localStorage.setItem("movimentai_notification_prompted", "true")
    setShowPrompt(false)

    if (granted) {
      console.log("[v0] Notifications enabled")
    }
  }

  const handleSkip = () => {
    localStorage.setItem("movimentai_notification_prompted", "true")
    setShowPrompt(false)
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full gold-gradient flex items-center justify-center mb-4">
            <Bell className="h-6 w-6 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center">Ativar Notificações?</DialogTitle>
          <DialogDescription className="text-center text-pretty">
            Para receber lembretes dos seus treinos e hábitos, permita notificações.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-4">
          <Button onClick={handleEnable} className="w-full gold-gradient text-primary-foreground font-semibold">
            Permitir Notificações
          </Button>
          <Button onClick={handleSkip} variant="ghost" className="w-full">
            Agora não
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
