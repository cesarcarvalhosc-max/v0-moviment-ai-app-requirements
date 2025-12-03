"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Check, SkipForward, Heart, Brain, Play, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSound } from "@/lib/sound-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { EXERCISES } from "@/lib/exercises-data"

type Exercise = {
  id: string
  name: string
  sets: number
  reps: string | number
  rest: number
  series: { completed: boolean }[]
  skipped: boolean
  videoUrl?: string
  imageUrl?: string
}

const MOTIVATIONAL_PHRASES = [
  "Concluído! Vamos pra cima! 🔥",
  "Mandou muito! Dia destruído 💪",
  "Parabéns, guerreiro(a)! ⚡",
  "Mais um dia vencido! Bora! 🚀",
  "Você é foda! Descansa agora 👊",
]

export default function ExecuteWorkoutPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { playClickSound } = useSound()
  const { supabaseUser } = useAuth()

  const [workout, setWorkout] = useState<any>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0)
  const [restSeconds, setRestSeconds] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number; color: string }[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    loadWorkout()
  }, [supabaseUser, params.id])

  const loadWorkout = async () => {
    if (!supabaseUser) return

    const supabase = createClient()
    const { data } = await supabase.from("workouts").select("*").eq("id", params.id).single()

    if (data) {
      setWorkout(data)

      // Get today's day of week
      const today = new Date().toLocaleDateString("pt-BR", { weekday: "short" })
      const dayMap: Record<string, string> = {
        seg: "Seg",
        ter: "Ter",
        qua: "Qua",
        qui: "Qui",
        sex: "Sex",
        sáb: "Sáb",
        dom: "Dom",
      }
      const todayKey = dayMap[today.toLowerCase()]

      // Get exercises for today from splits
      const todaysSplit = data.splits?.[todayKey]
      if (todaysSplit && todaysSplit.exercises) {
        const exercisesList = todaysSplit.exercises.map((exId: string) => {
          const exerciseData = EXERCISES.find((e) => e.id === exId)
          return {
            id: exId,
            name: exerciseData?.title || exId,
            sets: 3,
            reps: 12,
            rest: 60,
            series: Array(3).fill({ completed: false }),
            skipped: false,
            videoUrl: exerciseData?.videoUrl,
            imageUrl: exerciseData?.videoUrl,
          }
        })
        setExercises(exercisesList)
      }
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isResting && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            playClickSound()
            setIsResting(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isResting, restSeconds, playClickSound])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const completeSeries = () => {
    playClickSound()

    const newExercises = [...exercises]
    newExercises[currentExerciseIndex].series[currentSeriesIndex] = { completed: true }
    setExercises(newExercises)

    const currentExercise = exercises[currentExerciseIndex]
    const isLastSeries = currentSeriesIndex === currentExercise.sets - 1

    if (isLastSeries) {
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1)
        setCurrentSeriesIndex(0)
        setIsResting(false)
      } else {
        handleWorkoutComplete()
      }
    } else {
      setRestSeconds(currentExercise.rest)
      setIsResting(true)
      setCurrentSeriesIndex(currentSeriesIndex + 1)
    }
  }

  const skipExercise = () => {
    playClickSound()
    const newExercises = [...exercises]
    newExercises[currentExerciseIndex].skipped = true
    setExercises(newExercises)

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setCurrentSeriesIndex(0)
      setIsResting(false)
    } else {
      handleWorkoutComplete()
    }
  }

  const handleWorkoutComplete = () => {
    playClickSound()

    // Generate colorful confetti
    const colors = ["#FFD700", "#FFA500", "#FF69B4", "#00CED1", "#9370DB", "#32CD32"]
    const newConfetti = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
    setConfetti(newConfetti)

    // Show congratulations after short delay
    setTimeout(() => {
      setShowCongrats(true)
    }, 300)

    // Clear confetti after animation
    setTimeout(() => {
      setConfetti([])
    }, 4000)

    // Save workout completion to database
    saveWorkoutCompletion()
  }

  const saveWorkoutCompletion = async () => {
    if (!supabaseUser) return

    const supabase = createClient()
    const today = new Date().toISOString().split("T")[0]

    await supabase.from("calendar_entries").insert({
      user_id: supabaseUser.id,
      workout_id: params.id,
      date: today,
      status: "completed",
    })
  }

  const openExerciseVideo = (exercise: Exercise) => {
    playClickSound()
    setSelectedExercise(exercise)
    setShowVideoDialog(true)
  }

  const restProgress = restSeconds > 0 ? (restSeconds / exercises[currentExerciseIndex]?.rest) * 100 : 0
  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (restProgress / 100) * circumference

  const currentExercise = exercises[currentExerciseIndex]
  const allCompleted = exercises.every((ex) => ex.skipped || ex.series.every((s) => s.completed))

  if (!workout || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando treino...</p>
      </div>
    )
  }

  const todayDayName = new Date().toLocaleDateString("pt-BR", { weekday: "long" })

  return (
    <>
      {confetti.map((c) => (
        <div
          key={c.id}
          className="confetti"
          style={{
            left: `${c.left}%`,
            animationDelay: `${c.delay}s`,
            background: c.color,
          }}
        />
      ))}

      <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background pb-24">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-primary/20 p-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/workouts" onClick={playClickSound}>
              <Button variant="ghost" size="sm" className="touch-manipulation">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold capitalize">{todayDayName}</h1>
              <p className="text-sm text-primary font-medium">{workout.title}</p>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {!allCompleted && currentExercise && (
            <Card className="glassmorphic-card border-2 border-primary/30 shadow-2xl shadow-primary/20">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Exercício {currentExerciseIndex + 1} de {exercises.length}
                    </p>
                    <h2 className="text-2xl font-bold text-balance leading-tight">{currentExercise.name}</h2>

                    {currentExercise.videoUrl && (
                      <div
                        className="relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => openExerciseVideo(currentExercise)}
                      >
                        {currentExercise.videoUrl && !currentExercise.videoUrl.includes("placeholder.svg") ? (
                          <img
                            src={currentExercise.videoUrl || "/placeholder.svg"}
                            alt={currentExercise.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Play className="w-12 h-12 text-primary/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center backdrop-blur-sm">
                            <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium">
                        Série {currentSeriesIndex + 1}/{currentExercise.sets}
                      </span>
                      <span>•</span>
                      <span>{currentExercise.reps} reps</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipExercise}
                    className="text-muted-foreground touch-manipulation shrink-0"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </div>

                {/* Series progress */}
                <div className="flex gap-2">
                  {currentExercise.series.map((series, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex-1 h-2.5 rounded-full transition-all duration-300",
                        series.completed
                          ? "bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/50"
                          : idx === currentSeriesIndex
                            ? "bg-primary/40 animate-pulse"
                            : "bg-muted",
                      )}
                    />
                  ))}
                </div>

                {isResting ? (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-sm text-muted-foreground font-medium">Descanso</p>

                    {/* Circular timer */}
                    <div className="relative w-48 h-48 mx-auto">
                      <svg className="w-full h-full -rotate-90 transform">
                        <circle
                          cx="96"
                          cy="96"
                          r="90"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="90"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          className="text-primary transition-all duration-1000 ease-linear"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl font-bold text-primary tabular-nums">{formatTime(restSeconds)}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        playClickSound()
                        setIsResting(false)
                        setRestSeconds(0)
                      }}
                      className="touch-manipulation"
                    >
                      Pular descanso
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={completeSeries}
                    className="w-full h-16 text-lg font-bold gold-gradient touch-manipulation shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all"
                  >
                    <Check className="mr-2 h-6 w-6" />
                    Série Concluída!
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Exercise list */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground px-1">Todos os Exercícios</h3>
            {exercises.map((exercise, idx) => {
              const completedSeries = exercise.series.filter((s) => s.completed).length
              const isActive = idx === currentExerciseIndex

              return (
                <Card
                  key={exercise.id}
                  className={cn(
                    "transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]",
                    isActive && "border-primary/50 shadow-lg shadow-primary/20 glassmorphic-card",
                    (completedSeries === exercise.sets || exercise.skipped) && "opacity-50",
                  )}
                  onClick={() => openExerciseVideo(exercise)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {exercise.imageUrl && !exercise.imageUrl.includes("placeholder.svg") ? (
                        <img
                          src={exercise.imageUrl || "/placeholder.svg"}
                          alt={exercise.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                          <Play className="w-6 h-6 text-primary/50" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className={cn("font-semibold text-base truncate", exercise.skipped && "line-through")}>
                          {exercise.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {exercise.skipped
                            ? "Pulado"
                            : `${completedSeries}/${exercise.sets} séries • ${exercise.reps} reps`}
                        </p>
                      </div>

                      {completedSeries === exercise.sets && !exercise.skipped && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <Check className="w-5 h-5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      <Dialog open={showCongrats} onOpenChange={setShowCongrats}>
        <DialogContent className="max-w-sm glassmorphic-card border-2 border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-4xl text-center mb-4">🎉🔥🎉</DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-6 px-4 pb-2">
            <h3 className="text-3xl font-bold text-foreground text-balance leading-tight">
              {MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)]}
            </h3>
            <p className="text-base text-muted-foreground">Treino completo! Hora de descansar e se recuperar.</p>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={() => {
                playClickSound()
                // Navigate to cardio
                router.push("/dashboard/workouts/cardio")
              }}
              variant="outline"
              className="w-full h-12 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30 hover:from-red-500/20 hover:to-orange-500/20"
            >
              <Heart className="mr-2 h-5 w-5 text-red-500" />
              Adicionar Cardio (15-45min)
            </Button>

            <Button
              onClick={() => {
                playClickSound()
                // Navigate to meditation
                router.push("/dashboard")
              }}
              variant="outline"
              className="w-full h-12 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 hover:from-purple-500/20 hover:to-blue-500/20"
            >
              <Brain className="mr-2 h-5 w-5 text-purple-500" />
              Adicionar Meditação (5-15min)
            </Button>

            <Button
              onClick={() => {
                playClickSound()
                router.push("/dashboard")
              }}
              className="w-full h-14 text-lg font-bold gold-gradient shadow-xl shadow-primary/30"
            >
              Finalizar Treino
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-2xl glassmorphic-card p-0">
          {selectedExercise && (
            <>
              <div className="relative aspect-video w-full rounded-t-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                {selectedExercise.videoUrl && !selectedExercise.videoUrl.includes("placeholder.svg") ? (
                  <img
                    src={selectedExercise.videoUrl || "/placeholder.svg"}
                    alt={selectedExercise.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-20 h-20 text-primary/50" />
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
                  onClick={() => setShowVideoDialog(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{selectedExercise.name}</h3>
                <p className="text-muted-foreground">
                  {selectedExercise.sets} séries de {selectedExercise.reps} repetições
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
