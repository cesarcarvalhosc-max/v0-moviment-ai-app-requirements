"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Dumbbell,
  Droplet,
  Flame,
  Sparkles,
  Check,
  Calendar,
  Library,
  HomeIcon,
  Plus,
  Menu,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useSound } from "@/lib/sound-context"
import { useTheme } from "@/lib/theme-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

export default function DashboardPage() {
  const { user, supabaseUser, logout } = useAuth()
  const { playClickSound, soundEnabled, toggleSound } = useSound()
  const { theme, toggleTheme } = useTheme()

  const [greeting, setGreeting] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [showCongrats, setShowCongrats] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [waterTarget, setWaterTarget] = useState(8)
  const [waterGlasses, setWaterGlasses] = useState<boolean[]>(Array(8).fill(false))
  const [habits, setHabits] = useState<any[]>([])
  const [newHabit, setNewHabit] = useState("")
  const [weekProgress, setWeekProgress] = useState<boolean[]>([false, false, false, false, false, false, false])
  const [mindfulnessEnabled, setMindfulnessEnabled] = useState(false)
  const [showMindfulness, setShowMindfulness] = useState(false)
  const [mindfulnessCompleted, setMindfulnessCompleted] = useState(false)
  const [nextWorkout, setNextWorkout] = useState<any>(null)

  const [userProfile, setUserProfile] = useState<{
    name: string
    email: string
    goal: string
    photo_url?: string
  }>({
    name: "Usuário",
    email: "",
    goal: "",
    photo_url: "",
  })

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) {
        setGreeting("Bom dia")
      } else if (hour >= 12 && hour < 18) {
        setGreeting("Boa tarde")
      } else {
        setGreeting("Boa noite")
      }
    }

    const updateDate = () => {
      const now = new Date()
      const day = now.getDate()
      const month = now.toLocaleDateString("pt-BR", { month: "long" })
      const year = now.getFullYear()
      setCurrentDate(`Hoje é ${day} de ${month} de ${year}`)
    }

    updateGreeting()
    updateDate()
  }, [])

  useEffect(() => {
    if (supabaseUser) {
      loadDashboardData()
    }
  }, [supabaseUser])

  const loadDashboardData = async () => {
    if (!supabaseUser) return

    setIsLoading(true)
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    try {
      // Load habits
      const { data: habitsData } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", supabaseUser.id)
        .order("created_at", { ascending: true })

      if (habitsData) {
        setHabits(
          habitsData.map((h) => ({
            id: h.id,
            label: h.name,
            icon: h.icon,
            completed: h.completed_dates?.includes(today) || false,
          })),
        )
      }

      // Load water intake
      const { data: waterData } = await supabase
        .from("water_intake")
        .select("*")
        .eq("user_id", supabaseUser.id)
        .eq("date", today)
        .single()

      if (waterData) {
        setWaterTarget(waterData.goal_cups)
        const glasses = Array(waterData.goal_cups).fill(false)
        for (let i = 0; i < waterData.cups_completed; i++) {
          glasses[i] = true
        }
        setWaterGlasses(glasses)
      } else {
        // Create initial water entry
        await supabase.from("water_intake").insert({
          user_id: supabaseUser.id,
          date: today,
          cups_completed: 0,
          goal_cups: 8,
        })
      }

      // Load weekly progress from calendar
      const startOfWeek = getStartOfWeek(new Date())
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek)
        date.setDate(date.getDate() + i)
        return date.toISOString().split("T")[0]
      })

      const { data: calendarData } = await supabase
        .from("calendar_entries")
        .select("*")
        .eq("user_id", supabaseUser.id)
        .in("date", weekDates)

      if (calendarData) {
        const progress = weekDates.map((date) =>
          calendarData.some((entry) => entry.date === date && entry.status === "completed"),
        )
        setWeekProgress(progress)
      }

      const { data: workoutsData } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", supabaseUser.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (workoutsData && workoutsData.length > 0) {
        const workout = workoutsData[0]

        // Check today's workout from calendar
        const { data: todayEntry } = await supabase
          .from("calendar_entries")
          .select("*")
          .eq("user_id", supabaseUser.id)
          .eq("workout_id", workout.id)
          .eq("date", today)
          .single()

        if (todayEntry && todayEntry.status !== "completed") {
          setNextWorkout({ ...workout, date: today })
        } else {
          // Find next scheduled workout
          const { data: nextEntry } = await supabase
            .from("calendar_entries")
            .select("*, workouts(*)")
            .eq("user_id", supabaseUser.id)
            .gt("date", today)
            .eq("status", "scheduled")
            .order("date", { ascending: true })
            .limit(1)
            .single()

          if (nextEntry) {
            setNextWorkout({ ...nextEntry.workouts, date: nextEntry.date })
          }
        }
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("name, email, goal, photo_url, mindfulness_enabled, mindfulness_completed_dates")
        .eq("user_id", supabaseUser.id)
        .single()

      if (profileData) {
        setUserProfile({
          name: profileData.name || "Usuário",
          email: profileData.email || supabaseUser.email || "",
          goal: profileData.goal || "",
          photo_url: profileData.photo_url || "",
        })
        setMindfulnessEnabled(profileData.mindfulness_enabled || false)
        setMindfulnessCompleted(profileData.mindfulness_completed_dates?.includes(today) || false)
      }
    } catch (error) {
      console.error("[v0] Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(d.setDate(diff))
  }

  const toggleWaterGlass = async (index: number) => {
    if (!supabaseUser) return

    playClickSound()
    const newGlasses = [...waterGlasses]
    newGlasses[index] = !newGlasses[index]
    setWaterGlasses(newGlasses)

    const completedCount = newGlasses.filter(Boolean).length
    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    await supabase
      .from("water_intake")
      .update({ cups_completed: completedCount })
      .eq("user_id", supabaseUser.id)
      .eq("date", today)

    const allCompleted = newGlasses.slice(0, waterTarget).every((glass) => glass === true)
    if (allCompleted && newGlasses[index]) {
      setTimeout(() => {
        playClickSound()
        setShowCongrats(true)
      }, 200)
    }
  }

  const addWaterCapacity = async () => {
    if (waterTarget >= 28 || !supabaseUser) return

    playClickSound()
    const newTarget = waterTarget + 4
    setWaterTarget(newTarget)
    setWaterGlasses([...waterGlasses, ...Array(4).fill(false)])

    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    await supabase
      .from("water_intake")
      .update({ goal_cups: newTarget })
      .eq("user_id", supabaseUser.id)
      .eq("date", today)
  }

  const decreaseWaterCapacity = async () => {
    if (waterTarget <= 4 || !supabaseUser) return

    playClickSound()
    const newTarget = waterTarget - 1
    setWaterTarget(newTarget)
    const newGlasses = waterGlasses.slice(0, newTarget)
    setWaterGlasses(newGlasses)

    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    await supabase
      .from("water_intake")
      .update({
        goal_cups: newTarget,
        cups_completed: newGlasses.filter(Boolean).length,
      })
      .eq("user_id", supabaseUser.id)
      .eq("date", today)
  }

  const completedWater = waterGlasses.filter(Boolean).length

  const toggleHabit = async (id: string) => {
    if (!supabaseUser) return

    playClickSound()
    const habit = habits.find((h) => h.id === id)
    if (!habit) return

    const today = new Date().toISOString().split("T")[0]
    const supabase = createClient()

    // Get current completed dates
    const { data: habitData } = await supabase.from("habits").select("completed_dates").eq("id", id).single()

    const completedDates = habitData?.completed_dates || []
    let newCompletedDates: string[]

    if (completedDates.includes(today)) {
      newCompletedDates = completedDates.filter((d: string) => d !== today)
    } else {
      newCompletedDates = [...completedDates, today]
    }

    await supabase.from("habits").update({ completed_dates: newCompletedDates }).eq("id", id)

    setHabits(habits.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h)))
  }

  const addHabit = async () => {
    if (!newHabit.trim() || habits.length >= 20 || !supabaseUser) return

    playClickSound()
    const supabase = createClient()

    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: supabaseUser.id,
        name: newHabit,
        icon: "✨",
      })
      .select()
      .single()

    if (data) {
      setHabits([...habits, { id: data.id, label: data.name, icon: data.icon, completed: false }])
      setNewHabit("")
    }
  }

  const deleteHabit = async (id: string) => {
    if (!supabaseUser) return

    playClickSound()
    const supabase = createClient()

    await supabase.from("habits").delete().eq("id", id)

    setHabits(habits.filter((h) => h.id !== id))
  }

  const toggleMindfulness = async () => {
    if (!supabaseUser) return

    playClickSound()
    const newEnabled = !mindfulnessEnabled
    setMindfulnessEnabled(newEnabled)

    const supabase = createClient()
    await supabase.from("profiles").update({ mindfulness_enabled: newEnabled }).eq("user_id", supabaseUser.id)
  }

  const motivationalPhrases = [
    "Consistência = performance — mandou bem hoje!",
    "Cada gota conta para o sucesso!",
    "Você está no caminho certo!",
    "Manter-se hidratado é essencial!",
    "Disciplina transforma resultados!",
  ]

  const randomPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]

  const handleLogout = async () => {
    playClickSound()
    await logout()
    window.location.href = "/"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full gold-gradient mx-auto animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <header className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{greeting},</p>
              <h1 className="text-2xl font-bold">{userProfile?.name || "Usuário"}!</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  playClickSound()
                  toggleTheme()
                }}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={playClickSound}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 space-y-2">
                    <Link href="/dashboard/profile" onClick={playClickSound} className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        Minha Conta
                      </Button>
                    </Link>
                    <Link href="/dashboard/profile" onClick={playClickSound} className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        Editar Perfil
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        playClickSound()
                        toggleTheme()
                      }}
                    >
                      {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                      Tema ({theme === "dark" ? "Escuro" : "Claro"})
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        toggleSound()
                        playClickSound()
                      }}
                    >
                      {soundEnabled ? <Volume2 className="mr-2 h-4 w-4" /> : <VolumeX className="mr-2 h-4 w-4" />}
                      Sons ({soundEnabled ? "ON" : "OFF"})
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={playClickSound}>
                      Notificações
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={playClickSound}>
                      Histórico de Treinos
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={playClickSound}>
                      Configurações
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={playClickSound}>
                      Termos de uso
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={playClickSound}>
                      Política de Privacidade
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
                      Sair
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">{currentDate}</p>
        </header>

        <div className="px-6 space-y-6">
          <Card className="premium-card overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardDescription>Próximo treino</CardDescription>
                  <CardTitle className="text-2xl mt-1">
                    {nextWorkout ? nextWorkout.title : "Nenhum treino agendado"}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-medium">{nextWorkout?.difficulty || "N/A"}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextWorkout && (
                <>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4" />
                      <span>{nextWorkout.exercises_count || 6} exercícios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>•</span>
                      <span>{nextWorkout.duration || 30} min</span>
                    </div>
                  </div>

                  <Link href={`/dashboard/workouts/execute/${nextWorkout.id}`}>
                    <Button
                      onClick={playClickSound}
                      className="w-full gold-gradient text-primary-foreground font-semibold h-12"
                    >
                      Iniciar Treino
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Hidratação</CardTitle>
                <div className="flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-primary" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={decreaseWaterCapacity}
                    disabled={waterTarget <= 4}
                  >
                    <span className="text-lg">−</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={addWaterCapacity}
                    disabled={waterTarget >= 28}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{completedWater * 250}ml</span>
                <span className="text-muted-foreground">/ {waterTarget * 250}ml</span>
              </div>

              <Progress value={(completedWater / waterTarget) * 100} />

              <div className="grid grid-cols-8 gap-2">
                {waterGlasses.slice(0, waterTarget).map((checked, i) => (
                  <button
                    key={i}
                    onClick={() => toggleWaterGlass(i)}
                    className={cn(
                      "aspect-square rounded-lg border-2 transition-all flex items-center justify-center text-lg",
                      checked ? "bg-primary border-primary" : "border-border hover:border-primary/50",
                    )}
                  >
                    {checked ? <Check className="w-4 h-4 text-primary-foreground" /> : "💧"}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Hábitos Diários</CardTitle>
                <span className="text-xs text-muted-foreground">{habits.length}/20</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg group transition-all hover:bg-secondary/50",
                    habit.completed && "opacity-60",
                  )}
                >
                  <div
                    onClick={() => toggleHabit(habit.id)}
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer",
                      habit.completed ? "bg-primary border-primary" : "border-muted-foreground",
                    )}
                  >
                    {habit.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <span className={cn("text-sm flex-1", habit.completed && "line-through")}>{habit.label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                    onClick={() => deleteHabit(habit.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {habits.length < 20 && (
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addHabit()}
                    placeholder="Adicionar hábito..."
                    className="flex-1 h-9 px-3 rounded-lg bg-input border border-border text-foreground text-sm"
                  />
                  <Button size="sm" onClick={addHabit} className="h-9">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Mindfulness</CardTitle>
              <Button
                variant={mindfulnessEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleMindfulness}
                className={cn("text-xs", mindfulnessEnabled && "gold-gradient")}
              >
                {mindfulnessEnabled ? "ON" : "OFF"}
              </Button>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => {
                  playClickSound()
                  setShowMindfulness(true)
                }}
                className="w-full p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30 hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl">
                    🧠
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Meditação Diária</p>
                    <p className="text-xs text-muted-foreground">
                      {mindfulnessCompleted ? "Concluído hoje ✓" : "Clique para iniciar"}
                    </p>
                  </div>
                </div>
              </button>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Progresso Semanal</CardTitle>
              <CardDescription className="text-xs">Baseado nos treinos concluídos esta semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day, i) => {
                  const progressPercent = weekProgress[i] ? 100 : 0

                  return (
                    <div key={day} className="flex flex-col items-center gap-2">
                      <span className="text-xs text-muted-foreground">{day}</span>
                      <div
                        className={cn(
                          "w-full aspect-square rounded-lg border-2 flex items-center justify-center transition-all relative overflow-hidden",
                          weekProgress[i] ? "border-primary scale-110" : "border-border hover:border-primary/30",
                        )}
                      >
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-primary/30 transition-all duration-1000 ease-out"
                          style={{ height: `${progressPercent}%` }}
                        />
                        <div className="relative z-10">
                          {weekProgress[i] && <Dumbbell className="w-4 h-4 text-primary" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
          <div className="relative">
            <Link href="/dashboard/ai-assistant" onClick={playClickSound}>
              <Button
                size="lg"
                className="absolute left-1/2 -translate-x-1/2 -top-8 h-16 w-16 rounded-full gold-gradient shadow-lg shadow-primary/20 hover:scale-110 transition-transform"
              >
                <Sparkles className="h-7 w-7 text-primary-foreground" />
              </Button>
            </Link>

            <div className="grid grid-cols-4 h-16">
              <Link
                href="/dashboard"
                onClick={playClickSound}
                className="flex flex-col items-center justify-center gap-1 text-primary"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="text-xs font-medium">Home</span>
              </Link>

              <Link
                href="/dashboard/workouts"
                onClick={playClickSound}
                className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Dumbbell className="w-5 h-5" />
                <span className="text-xs">Treino</span>
              </Link>

              <Link
                href="/dashboard/library"
                onClick={playClickSound}
                className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Library className="w-5 h-5" />
                <span className="text-xs">Biblioteca</span>
              </Link>

              <Link
                href="/dashboard/calendar"
                onClick={playClickSound}
                className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span className="text-xs">Calendário</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>

      <Dialog open={showMindfulness} onOpenChange={setShowMindfulness}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Meditação Guiada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Vídeo de meditação será anexado em breve</p>
            </div>
            <Button
              onClick={async () => {
                playClickSound()
                if (!supabaseUser) return

                const supabase = createClient()
                const today = new Date().toISOString().split("T")[0]

                const { data: profileData } = await supabase
                  .from("profiles")
                  .select("mindfulness_completed_dates")
                  .eq("user_id", supabaseUser.id)
                  .single()

                const completedDates = profileData?.mindfulness_completed_dates || []
                if (!completedDates.includes(today)) {
                  await supabase
                    .from("profiles")
                    .update({ mindfulness_completed_dates: [...completedDates, today] })
                    .eq("user_id", supabaseUser.id)

                  setMindfulnessCompleted(true)
                }

                setShowMindfulness(false)
              }}
              className="w-full gold-gradient"
            >
              Marcar como Concluído
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="max-w-sm rounded-2xl">
          <div className="text-center space-y-3 py-2">
            <div className="text-5xl">🎉</div>
            <p className="text-xl font-bold">{randomPhrase}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
