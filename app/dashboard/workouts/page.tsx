"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Sparkles, Edit, Dumbbell, Flame } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useSound } from "@/lib/sound-context"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

type Workout = {
  id: string
  title: string
  duration: number
  difficulty: "Leve" | "Moderado" | "Alto"
  exercises: number
  type: "ai" | "manual" | "template"
  daysPerWeek?: number
  selectedDays?: string[]
  splits?: Record<string, any[]>
}

export default function WorkoutsPage() {
  const { playClickSound } = useSound()
  const { supabaseUser } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [defaultWorkoutId, setDefaultWorkoutId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (supabaseUser) {
      loadWorkouts()
    }
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
      setWorkouts(
        data.map((w) => ({
          id: w.id,
          title: w.title,
          duration: w.duration || 30,
          difficulty: w.difficulty || "Moderado",
          exercises: w.exercises_count || 6,
          type: w.type || "ai",
          daysPerWeek: w.days_per_week,
          selectedDays: w.selected_days,
          splits: w.splits,
        })),
      )

      // Load default workout
      const { data: profileData } = await supabase
        .from("profiles")
        .select("default_workout_id")
        .eq("user_id", supabaseUser.id)
        .single()

      if (profileData) {
        setDefaultWorkoutId(profileData.default_workout_id)
      }
    }
  }

  const [showAIDialog, setShowAIDialog] = useState(false)
  const [aiForm, setAiForm] = useState({
    sex: "",
    age: "",
    activityLevel: "",
    daysPerWeek: 0,
    selectedDays: [] as string[],
    goal: "",
    workoutName: "",
  })

  const DAYS_OPTIONS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

  const toggleDay = (day: string) => {
    playClickSound()
    const current = aiForm.selectedDays
    if (current.includes(day)) {
      setAiForm({ ...aiForm, selectedDays: current.filter((d) => d !== day) })
    } else {
      if (current.length < aiForm.daysPerWeek) {
        setAiForm({ ...aiForm, selectedDays: [...current, day] })
      }
    }
  }

  const generateLocalWorkout = async () => {
    playClickSound()

    const { daysPerWeek, selectedDays, goal, workoutName, sex, age, activityLevel } = aiForm

    // Validation
    if (
      !sex ||
      !age ||
      !activityLevel ||
      !daysPerWeek ||
      selectedDays.length !== daysPerWeek ||
      !goal ||
      !workoutName
    ) {
      alert("Por favor, preencha todos os campos corretamente")
      return
    }

    // Generate splits based on days per week
    const splits: Record<string, any> = {}

    if (daysPerWeek === 3) {
      splits[selectedDays[0]] = {
        name: "Full Body Express A",
        exercises: ["chest-1", "back-1", "legs-1", "shoulders-1", "abs-1"],
      }
      splits[selectedDays[1]] = {
        name: "Full Body Express B",
        exercises: ["chest-2", "back-2", "legs-2", "triceps-1", "abs-2"],
      }
      splits[selectedDays[2]] = {
        name: "Full Body Express C",
        exercises: ["chest-3", "back-3", "legs-3", "biceps-1", "abs-3"],
      }
    } else if (daysPerWeek === 4) {
      splits[selectedDays[0]] = {
        name: "Peito & Tríceps",
        exercises: ["chest-1", "chest-2", "chest-3", "triceps-1", "triceps-2", "triceps-3"],
      }
      splits[selectedDays[1]] = {
        name: "Costas & Bíceps",
        exercises: ["back-1", "back-2", "back-3", "biceps-1", "biceps-2", "biceps-3"],
      }
      splits[selectedDays[2]] = {
        name: "Pernas Completo",
        exercises: ["legs-1", "legs-2", "legs-3", "posterior-1", "posterior-2"],
      }
      splits[selectedDays[3]] = {
        name: "Full Body Express",
        exercises: ["chest-1", "back-1", "shoulders-1", "legs-1", "abs-1"],
      }
    } else if (daysPerWeek === 5) {
      splits[selectedDays[0]] = {
        name: "Peito & Tríceps",
        exercises: ["chest-1", "chest-2", "chest-3", "triceps-1", "triceps-2"],
      }
      splits[selectedDays[1]] = {
        name: "Costas & Bíceps",
        exercises: ["back-1", "back-2", "back-3", "biceps-1", "biceps-2"],
      }
      splits[selectedDays[2]] = { name: "Pernas Completo", exercises: ["legs-1", "legs-2", "legs-3", "posterior-1"] }
      splits[selectedDays[3]] = {
        name: "Ombros & Core",
        exercises: ["shoulders-1", "shoulders-2", "shoulders-3", "abs-1", "abs-2", "abs-3"],
      }
      splits[selectedDays[4]] = { name: "Full Body Express", exercises: ["chest-1", "back-1", "legs-1", "shoulders-1"] }
    } else if (daysPerWeek === 6) {
      splits[selectedDays[0]] = {
        name: "Peito & Tríceps",
        exercises: ["chest-1", "chest-2", "chest-3", "triceps-1", "triceps-2", "triceps-3"],
      }
      splits[selectedDays[1]] = {
        name: "Costas & Bíceps",
        exercises: ["back-1", "back-2", "back-3", "biceps-1", "biceps-2", "biceps-3"],
      }
      splits[selectedDays[2]] = {
        name: "Pernas Completo",
        exercises: ["legs-1", "legs-2", "legs-3", "posterior-1", "posterior-2", "posterior-3"],
      }
      splits[selectedDays[3]] = {
        name: "Ombros & Core",
        exercises: ["shoulders-1", "shoulders-2", "shoulders-3", "abs-1", "abs-2", "abs-3"],
      }
      splits[selectedDays[4]] = {
        name: "Full Body Express",
        exercises: ["chest-1", "back-1", "legs-1", "shoulders-1", "abs-1"],
      }
      splits[selectedDays[5]] = { name: "Peito & Tríceps", exercises: ["chest-1", "chest-2", "triceps-1", "triceps-2"] }
    }

    // Adjust intensity based on profile
    const ageNum = Number.parseInt(age)
    const isSedentary = activityLevel === "sedentary"
    const isFemale = sex === "female"
    const isOlder = ageNum > 45

    let difficulty: "Leve" | "Moderado" | "Alto" = "Moderado"
    if ((isSedentary || isOlder) && isFemale) {
      difficulty = "Leve"
    } else if (activityLevel === "very-active" || activityLevel === "athlete") {
      difficulty = "Alto"
    }

    const newWorkout: Workout = {
      id: Date.now().toString(),
      title: workoutName,
      duration: 30,
      difficulty,
      exercises: Object.keys(splits).length * 5,
      type: "ai",
      daysPerWeek,
      selectedDays,
      splits,
    }

    if (!supabaseUser) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("workouts")
      .insert({
        user_id: supabaseUser.id,
        title: workoutName,
        type: "ai",
        difficulty,
        duration: 30,
        exercises_count: Object.keys(splits).length * 5,
        days_per_week: daysPerWeek,
        selected_days: selectedDays,
        splits: splits,
      })
      .select()
      .single()

    if (data) {
      // Create calendar entries
      for (const day of selectedDays) {
        const dayIndex = DAYS_OPTIONS.indexOf(day)
        const today = new Date()
        const currentDay = today.getDay()
        const diff = (dayIndex + 1 - currentDay + 7) % 7
        const nextDate = new Date(today)
        nextDate.setDate(today.getDate() + diff)

        await supabase.from("calendar_entries").insert({
          user_id: supabaseUser.id,
          workout_id: data.id,
          date: nextDate.toISOString().split("T")[0],
          status: "scheduled",
        })
      }

      await loadWorkouts()
      alert("Treino criado com sucesso!")
      router.push("/dashboard/workouts/library")
    }

    setShowAIDialog(false)

    // Reset form
    setAiForm({
      sex: "",
      age: "",
      activityLevel: "",
      daysPerWeek: 0,
      selectedDays: [],
      goal: "",
      workoutName: "",
    })
  }

  const setAsDefault = async (workoutId: string) => {
    if (!supabaseUser) return

    playClickSound()
    const supabase = createClient()
    await supabase.from("profiles").update({ default_workout_id: workoutId }).eq("user_id", supabaseUser.id)

    setDefaultWorkoutId(workoutId)
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard" onClick={playClickSound}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Meus Treinos</h1>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
            <DialogTrigger asChild>
              <Card
                className="cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98] glassmorphic-card"
                onClick={playClickSound}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Gerar com IA</p>
                    <p className="text-xs text-muted-foreground">Treino personalizado</p>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Gerar Treino com IA</DialogTitle>
                <DialogDescription>Configure seu treino personalizado baseado no seu perfil</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Sex */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Sexo</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["male", "female", "prefer-not"].map((option) => (
                      <Button
                        key={option}
                        type="button"
                        variant={aiForm.sex === option ? "default" : "outline"}
                        onClick={() => {
                          playClickSound()
                          setAiForm({ ...aiForm, sex: option })
                        }}
                        className={cn(aiForm.sex === option && "gold-gradient")}
                      >
                        {option === "male" ? "Masculino" : option === "female" ? "Feminino" : "Prefiro não dizer"}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-3">
                  <Label htmlFor="age" className="text-base font-semibold">
                    Idade
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Digite sua idade"
                    value={aiForm.age}
                    onChange={(e) => setAiForm({ ...aiForm, age: e.target.value })}
                    className="text-base"
                  />
                </div>

                {/* Activity Level */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Nível de atividade atual</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: "sedentary", label: "Sedentário" },
                      { value: "lightly-active", label: "Levemente ativo" },
                      { value: "moderately-active", label: "Moderadamente ativo" },
                      { value: "very-active", label: "Muito ativo" },
                      { value: "athlete", label: "Atleta" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={aiForm.activityLevel === option.value ? "default" : "outline"}
                        onClick={() => {
                          playClickSound()
                          setAiForm({ ...aiForm, activityLevel: option.value })
                        }}
                        className={cn(
                          "justify-start text-left h-auto py-3",
                          aiForm.activityLevel === option.value && "gold-gradient",
                        )}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Days per week */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Quantos dias por semana você quer treinar?</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 4, 5, 6].map((days) => (
                      <Button
                        key={days}
                        type="button"
                        variant={aiForm.daysPerWeek === days ? "default" : "outline"}
                        onClick={() => {
                          playClickSound()
                          setAiForm({ ...aiForm, daysPerWeek: days, selectedDays: [] })
                        }}
                        className={cn(aiForm.daysPerWeek === days && "gold-gradient")}
                      >
                        {days} dias
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Which days */}
                {aiForm.daysPerWeek > 0 && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      Quais dias da semana? (selecione {aiForm.daysPerWeek})
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS_OPTIONS.map((day) => (
                        <Button
                          key={day}
                          type="button"
                          variant={aiForm.selectedDays.includes(day) ? "default" : "outline"}
                          onClick={() => toggleDay(day)}
                          className={cn(aiForm.selectedDays.includes(day) && "gold-gradient")}
                          disabled={
                            !aiForm.selectedDays.includes(day) && aiForm.selectedDays.length >= aiForm.daysPerWeek
                          }
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {aiForm.selectedDays.length}/{aiForm.daysPerWeek} dias selecionados
                    </p>
                  </div>
                )}

                {/* Goal */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Objetivo principal</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {["Perder gordura", "Ganhar massa muscular", "Saúde e bem-estar", "Força máxima"].map((goal) => (
                      <Button
                        key={goal}
                        type="button"
                        variant={aiForm.goal === goal ? "default" : "outline"}
                        onClick={() => {
                          playClickSound()
                          setAiForm({ ...aiForm, goal })
                        }}
                        className={cn("justify-start text-left h-auto py-3", aiForm.goal === goal && "gold-gradient")}
                      >
                        {goal}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Workout Name */}
                <div className="space-y-3">
                  <Label htmlFor="workout-name" className="text-base font-semibold">
                    Nome personalizado para esse treino
                  </Label>
                  <Input
                    id="workout-name"
                    type="text"
                    placeholder="ex: Treino Iniciante 2025 ou Treino Verão 50+"
                    value={aiForm.workoutName}
                    onChange={(e) => setAiForm({ ...aiForm, workoutName: e.target.value })}
                    className="text-base"
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateLocalWorkout}
                  className="w-full gold-gradient text-primary-foreground font-bold h-14 text-lg"
                >
                  Gerar meu treino com IA
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Link href="/dashboard/workouts/create" onClick={playClickSound}>
            <Card className="h-full cursor-pointer hover:scale-[1.02] transition-transform active:scale-[0.98]">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3 h-full">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <Edit className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Criar Manual</p>
                  <p className="text-xs text-muted-foreground">Do zero</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Biblioteca de Treinos</h2>
          <div className="space-y-3">
            {workouts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <p>Nenhum treino criado ainda</p>
                  <p className="text-sm mt-2">Gere um treino com IA ou crie manualmente</p>
                </CardContent>
              </Card>
            ) : (
              workouts.map((workout) => (
                <Link key={workout.id} href={`/dashboard/workouts/execute/${workout.id}`} onClick={playClickSound}>
                  <Card className="hover:scale-[1.01] transition-transform cursor-pointer glassmorphic-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{workout.title}</h3>
                            {workout.type === "ai" && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 rounded text-xs font-medium border border-purple-400/30">
                                IA
                              </span>
                            )}
                            {defaultWorkoutId === workout.id && (
                              <span className="px-2 py-0.5 gold-gradient text-primary-foreground rounded text-xs font-medium">
                                Padrão
                              </span>
                            )}
                          </div>

                          {workout.daysPerWeek && (
                            <p className="text-xs text-muted-foreground">
                              {workout.daysPerWeek} dias por semana • {workout.selectedDays?.join(", ")}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Dumbbell className="w-4 h-4" />
                              <span>{workout.exercises} exercícios</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Flame className={cn("w-4 h-4", workout.difficulty === "Alto" && "text-primary")} />
                              <span>{workout.difficulty}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          {defaultWorkoutId !== workout.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setAsDefault(workout.id)
                              }}
                              className="text-xs h-7"
                            >
                              Definir como Padrão
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
