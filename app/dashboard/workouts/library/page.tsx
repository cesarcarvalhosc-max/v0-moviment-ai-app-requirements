"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Dumbbell, Sparkles, Clock, TrendingUp } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Workout {
  id: string
  title: string
  type: "ai" | "manual"
  difficulty: string
  duration: number
  exercises_count: number
  days_per_week?: number
  splits?: Record<string, any>
}

export default function WorkoutLibraryPage() {
  const router = useRouter()
  const { supabaseUser } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkouts()
  }, [supabaseUser])

  const loadWorkouts = async () => {
    if (!supabaseUser) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", supabaseUser.id)
      .order("created_at", { ascending: false })

    if (data) {
      setWorkouts(data)
    }
    setLoading(false)
  }

  const filteredWorkouts = workouts.filter((workout) => workout.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/workouts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Biblioteca de Treinos</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar treinos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </header>

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando treinos...</p>
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "Nenhum treino encontrado" : "Você ainda não tem treinos salvos"}
            </p>
          </div>
        ) : (
          filteredWorkouts.map((workout) => (
            <Card
              key={workout.id}
              className={cn(
                "overflow-hidden hover:scale-[1.02] transition-all active:scale-[0.98] cursor-pointer",
                "relative backdrop-blur-sm",
                workout.type === "ai"
                  ? "bg-gradient-to-br from-primary/10 via-background to-background border-primary/30"
                  : "bg-gradient-to-br from-secondary/20 via-background to-background border-secondary/30",
                "shadow-lg hover:shadow-xl",
                "before:absolute before:inset-0 before:rounded-lg before:p-[1px]",
                "before:bg-gradient-to-br before:from-primary/50 before:via-transparent before:to-primary/20",
                "before:-z-10",
              )}
              onClick={() => router.push(`/dashboard/workouts/execute/${workout.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon with bubble effect */}
                  <div
                    className={cn(
                      "relative w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0",
                      "bg-gradient-to-br shadow-lg",
                      workout.type === "ai"
                        ? "from-primary/30 to-primary/10 shadow-primary/30"
                        : "from-secondary/30 to-secondary/10 shadow-secondary/30",
                      "before:absolute before:inset-0 before:rounded-full",
                      "before:bg-gradient-to-tr before:from-white/20 before:to-transparent",
                      "before:blur-sm",
                      "animate-pulse",
                    )}
                  >
                    {workout.type === "ai" ? (
                      <Sparkles className="w-8 h-8 text-primary relative z-10" />
                    ) : (
                      <Dumbbell className="w-8 h-8 text-secondary relative z-10" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-balance leading-tight">{workout.title}</h3>
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap",
                            workout.type === "ai"
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-secondary/20 text-secondary border border-secondary/30",
                          )}
                        >
                          {workout.type === "ai" ? "IA" : "Manual"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {workout.days_per_week ? `${workout.days_per_week} dias por semana` : "Treino personalizado"}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{workout.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span>{workout.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell className="w-4 h-4 text-muted-foreground" />
                        <span>{workout.exercises_count} exercícios</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
