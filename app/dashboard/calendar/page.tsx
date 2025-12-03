"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Dumbbell,
  Flame,
  CalendarDays,
  CalendarRange,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSound } from "@/lib/sound-context"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Workout = {
  id: string
  title: string
  duration: number
  difficulty: "Leve" | "Moderado" | "Alto"
  exercises: number
  completed: boolean
}

export default function CalendarPage() {
  const { playClickSound } = useSound()
  const { supabaseUser } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week">("month")
  const [workouts, setWorkouts] = useState<Record<string, Workout[]>>({})
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState("")
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([])

  const DAYS_OF_WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  const MONTHS = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  useEffect(() => {
    if (supabaseUser) {
      loadCalendarData()
      loadAvailableWorkouts()
    }
  }, [supabaseUser, currentDate])

  const loadCalendarData = async () => {
    if (!supabaseUser) return

    const supabase = createClient()
    const startDate =
      view === "month" ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1) : getWeekDays()[0]
    const endDate =
      view === "month" ? new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0) : getWeekDays()[6]

    const { data } = await supabase
      .from("calendar_entries")
      .select("*, workouts(*)")
      .eq("user_id", supabaseUser.id)
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])

    if (data) {
      const grouped: Record<string, Workout[]> = {}
      data.forEach((entry) => {
        const workout = entry.workouts
        if (!grouped[entry.date]) grouped[entry.date] = []
        grouped[entry.date].push({
          id: entry.id,
          title: workout.title,
          duration: workout.duration || 30,
          difficulty: workout.difficulty || "Moderado",
          exercises: workout.exercises_count || 6,
          completed: entry.status === "completed",
        })
      })
      setWorkouts(grouped)
    }
  }

  const loadAvailableWorkouts = async () => {
    if (!supabaseUser) return

    const supabase = createClient()
    const { data } = await supabase.from("workouts").select("*").eq("user_id", supabaseUser.id)

    if (data) {
      setAvailableWorkouts(data)
    }
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getWeekDays = () => {
    const curr = new Date(currentDate)
    const week = []
    curr.setDate(curr.getDate() - curr.getDay())

    for (let i = 0; i < 7; i++) {
      week.push(new Date(curr))
      curr.setDate(curr.getDate() + 1)
    }

    return week
  }

  const formatDateKey = (date: Date) => date.toISOString().split("T")[0]

  const goToPrevious = () => {
    playClickSound()
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setDate(newDate.getDate() - 7)
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    playClickSound()
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    setCurrentDate(newDate)
  }

  const addWorkoutToDate = async (workoutId: string) => {
    if (!supabaseUser || !selectedDate) return

    playClickSound()
    const supabase = createClient()

    await supabase.from("calendar_entries").insert({
      user_id: supabaseUser.id,
      workout_id: workoutId,
      date: selectedDate,
      status: "scheduled",
    })

    await loadCalendarData()
    setShowAddDialog(false)
  }

  const days = view === "month" ? getMonthDays() : getWeekDays()
  const today = formatDateKey(new Date())

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard" onClick={playClickSound}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex-1">Calendário</h1>

          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                playClickSound()
                setView("month")
              }}
              className={cn("h-8", view === "month" && "bg-primary")}
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                playClickSound()
                setView("week")
              }}
              className={cn("h-8", view === "week" && "bg-primary")}
            >
              <CalendarRange className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button variant="ghost" size="sm" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="p-6">
        {view === "month" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} className="aspect-square" />
                }

                const dateKey = formatDateKey(day)
                const dayWorkouts = workouts[dateKey] || []
                const isToday = dateKey === today
                const hasWorkout = dayWorkouts.length > 0
                const allCompleted = hasWorkout && dayWorkouts.every((w) => w.completed)

                return (
                  <button
                    key={dateKey}
                    onClick={playClickSound}
                    className={cn(
                      "aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all hover:scale-105",
                      isToday && "border-primary bg-primary/10",
                      !isToday && !hasWorkout && "border-border",
                      hasWorkout && !isToday && "border-primary/30",
                      allCompleted && "bg-primary/20",
                    )}
                  >
                    <span className={cn("text-sm font-medium", isToday && "text-primary")}>{day.getDate()}</span>
                    {hasWorkout && (
                      <div className="flex gap-0.5">
                        {dayWorkouts.map((w) => (
                          <div
                            key={w.id}
                            className={cn("w-1 h-1 rounded-full", w.completed ? "bg-primary" : "bg-primary/40")}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {days.map((day, index) => {
              const dateKey = formatDateKey(day)
              const dayWorkouts = workouts[dateKey] || []
              const isToday = formatDateKey(new Date()) === dateKey

              return (
                <div key={index} className="space-y-2">
                  <div className={cn("flex items-center gap-3 pb-2", isToday && "text-primary")}>
                    <div className="flex-1 flex items-center gap-3">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex flex-col items-center justify-center",
                          isToday ? "gold-gradient" : "bg-secondary",
                        )}
                      >
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isToday ? "text-primary-foreground" : "text-muted-foreground",
                          )}
                        >
                          {DAYS_OF_WEEK[day.getDay()]}
                        </span>
                        <span className={cn("text-lg font-bold", isToday && "text-primary-foreground")}>
                          {day.getDate()}
                        </span>
                      </div>

                      {dayWorkouts.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Dumbbell className="w-4 h-4" />
                          <span>
                            {dayWorkouts.length} {dayWorkouts.length === 1 ? "treino" : "treinos"}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        playClickSound()
                        setSelectedDate(formatDateKey(day))
                        setShowAddDialog(true)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {dayWorkouts.length > 0 ? (
                    <div className="space-y-2 ml-15">
                      {dayWorkouts.map((workout) => (
                        <Card
                          key={workout.id}
                          className={cn(
                            "cursor-pointer hover:scale-[1.01] transition-transform",
                            workout.completed ? "opacity-70" : "glassmorphic-card",
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className={cn("font-semibold", workout.completed && "line-through")}>
                                    {workout.title}
                                  </h3>
                                  {workout.completed && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                      <Check className="w-3 h-3 text-primary-foreground" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{workout.exercises} exercícios</span>
                                  <span>•</span>
                                  <span>{workout.duration} min</span>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Flame className={cn("w-3 h-3", workout.difficulty === "Alto" && "text-primary")} />
                                    <span>{workout.difficulty}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="ml-15 py-4 text-center border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground">
                      Nenhum treino agendado
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-24 right-6">
        <Button size="lg" className="h-14 w-14 rounded-full gold-gradient shadow-lg shadow-primary/20">
          <Plus className="h-6 w-6 text-primary-foreground" />
        </Button>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Treino</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {availableWorkouts.map((workout) => (
              <Button
                key={workout.id}
                variant="outline"
                className="w-full justify-start h-auto py-3 bg-transparent"
                onClick={() => addWorkoutToDate(workout.id)}
              >
                <div className="text-left">
                  <p className="font-semibold">{workout.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {workout.exercises_count} exercícios • {workout.duration} min
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
