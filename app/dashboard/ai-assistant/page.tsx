"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useSound } from "@/lib/sound-context"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const QUICK_REPLIES = [
  "Ajustar treino de hoje",
  "Sugerir tempo de descanso",
  "Dicas de nutrição",
  "Criar treino rápido (15 min)",
]

export default function AIAssistantPage() {
  const { user } = useAuth()
  const { playClickSound } = useSound()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! Sou a MARI, sua assistente fitness 24/7 especializada em treinos, mindfulness e bem-estar. Como posso ajudar você hoje?\n\nLembre-se: Minhas sugestões não substituem orientações de profissionais de saúde.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    playClickSound()
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: user?.name || "Usuário",
          email: user?.email || "unknown@email.com",
          mensagem: content,
          data: new Date().toISOString(),
          contexto: "ai-assistant-chat",
        }),
      })

      const data = await response.json()

      const aiResponse = data.response || data.message || "Entendi sua mensagem! Estou processando."

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Entendi sua solicitação: "${content}"\n\nEstou temporariamente processando essa informação. Enquanto isso, posso te ajudar com:\n\n• Criar treinos personalizados\n• Ajustar seu calendário\n• Acessar a biblioteca de exercícios\n• Ver seu progresso\n\nQual dessas opções te interessa?`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickReply = (reply: string) => {
    sendMessage(reply)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" onClick={playClickSound}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden gold-gradient flex items-center justify-center">
              <img
                src="/female-fitness-assistant-avatar.jpg"
                alt="MARI Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold">MARI</h1>
              <p className="text-xs text-muted-foreground">Assistente fitness 24/7</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full overflow-hidden gold-gradient flex items-center justify-center flex-shrink-0">
                <img src="/female-fitness-assistant-avatar.jpg" alt="MARI" className="w-full h-full object-cover" />
              </div>
            )}

            <Card
              className={cn("max-w-[80%]", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card")}
            >
              <CardContent className="p-3">
                <p className="text-sm whitespace-pre-wrap text-pretty leading-relaxed">{message.content}</p>
                <p
                  className={cn(
                    "text-xs mt-2",
                    message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {message.timestamp.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </CardContent>
            </Card>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold">{user?.name?.[0] || "U"}</span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full overflow-hidden gold-gradient flex items-center justify-center flex-shrink-0">
              <img src="/female-fitness-assistant-avatar.jpg" alt="MARI" className="w-full h-full object-cover" />
            </div>
            <Card className="bg-card">
              <CardContent className="p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">MARI está pensando...</span>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-6 pb-4">
          <p className="text-xs text-muted-foreground mb-3">Sugestões rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.map((reply) => (
              <Button
                key={reply}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply(reply)}
                className="text-xs"
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border p-4 bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="gold-gradient text-primary-foreground"
            size="icon"
            onClick={playClickSound}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
