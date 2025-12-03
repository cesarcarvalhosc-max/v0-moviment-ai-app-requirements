"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSound } from "@/lib/sound-context"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"
import { EXERCISES_DATA, EXERCISES } from "@/lib/exercises-data"

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

export default function CreateManualWorkoutPage() {
  const router = useRouter()
  const { playClickSound } = useSound()
  const { supabaseUser } = useAuth()

  const [workoutName, setWorkoutName] = useState("")
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [dayExercises, setDayExercises] = useState<Record<number, string[]>>({})
  const [isRest, setIsRest] = useState<Record<number, boolean>>({})

  const toggleExercise = (exerciseId: string) => {
    playClickSound()
    const current = dayExercises[currentDayIndex] || []

    if (current.includes(exerciseId)) {
      setDayExercises({
        ...dayExercises,
        [currentDayIndex]: current.filter((id) => id !== exerciseId),
      })
    } else {
      setDayExercises({
        ...dayExercises,
        [currentDayIndex]: [...current, exerciseId],
      })
    }
  }

  const toggleRest = () => {
    playClickSound()
    setIsRest({
      ...isRest,
      [currentDayIndex]: !isRest[currentDayIndex],
    })
  }

  const goToNextDay = () => {
    playClickSound()
    if (currentDayIndex < DAYS.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1)
    }
  }

  const goToPreviousDay = () => {
    playClickSound()
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1)
    }
  }

  const saveWorkout = async () => {
    if (!workoutName.trim() || !supabaseUser) return

    playClickSound()
    const supabase = createClient()

    const splits: Record<string, any> = {}
    DAYS.forEach((day, idx) => {
      if (isRest[idx]) {
        splits[day] = { name: "Descanso", exercises: [] }
      } else if (dayExercises[idx] && dayExercises[idx].length > 0) {
        splits[day] = {
          name: `Treino ${day}`,
          exercises: dayExercises[idx],
        }
      }
    })

    const totalExercises = Object.values(dayExercises).reduce((sum, arr) => sum + arr.length, 0)

    const { data, error } = await supabase
      .from("workouts")
      .insert({
        user_id: supabaseUser.id,
        title: workoutName,
        type: "manual",
        difficulty: "Moderado",
        duration: 30,
        exercises_count: totalExercises,
        splits: splits,
      })
      .select()
      .single()

    if (data) {
      router.push("/dashboard/workouts/library")
    }
  }

  const currentExercises = dayExercises[currentDayIndex] || []
  const currentIsRest = isRest[currentDayIndex] || false

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/workouts" onClick={playClickSound}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Criar Treino Manual</h1>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="workout-name">Nome do Treino</Label>
          <Input
            id="workout-name"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Ex: Meu Treino Personalizado"
          />
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={goToPreviousDay} disabled={currentDayIndex === 0}>
            Anterior
          </Button>
          <div className="text-center">
            <p className="text-lg font-bold">{DAYS[currentDayIndex]}</p>
            <p className="text-xs text-muted-foreground">
              Dia {currentDayIndex + 1} de {DAYS.length}
            </p>
          </div>
          <Button variant="outline" onClick={goToNextDay} disabled={currentDayIndex === DAYS.length - 1}>
            Próximo
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={currentIsRest ? "default" : "outline"}
            onClick={toggleRest}
            className={cn(currentIsRest && "gold-gradient")}
          >
            {currentIsRest ? "Dia de Descanso ✓" : "Marcar como Descanso"}
          </Button>
        </div>

        {!currentIsRest && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{currentExercises.length} exercícios selecionados</p>

            {Object.entries(EXERCISES_DATA).map(([category, exercises]) => (
              <div key={category} className="space-y-2">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground">{category}</h3>
                {exercises.map((exercise) => {
                  const fullExercise = EXERCISES.find((e) => e.id === exercise.id)
                  const hasValidImage =
                    fullExercise?.videoUrl &&
                    fullExercise.videoUrl.trim() !== "" &&
                    !fullExercise.videoUrl.includes("placeholder.svg")

                  return (
                    <Card
                      key={exercise.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        currentExercises.includes(exercise.id) && "border-primary bg-primary/5",
                      )}
                      onClick={() => toggleExercise(exercise.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {hasValidImage ? (
                            <img
                              src={fullExercise.videoUrl || "/placeholder.svg"}
                              alt={exercise.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <span className="text-2xl">💪</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground">{exercise.primaryMuscles.join(", ")}</p>
                        </div>

                        {currentExercises.includes(exercise.id) && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={saveWorkout}
          className="w-full gold-gradient h-12 font-semibold"
          disabled={!workoutName.trim()}
        >
          Salvar Treino
        </Button>
      </div>
    </div>
  )
}
