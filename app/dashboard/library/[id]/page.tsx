"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Play, Plus, Volume2, AlertCircle, Wind, Target } from "lucide-react"
import { EXERCISES } from "@/lib/exercises-data"

export default function ExerciseDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const exercise = EXERCISES.find((e) => e.id === id)

  if (!exercise) {
    return <div className="p-6">Exercício não encontrado</div>
  }

  const hasValidVideo =
    exercise.videoUrl && exercise.videoUrl.trim() !== "" && !exercise.videoUrl.includes("placeholder.svg")

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-6 flex items-center gap-4">
        <Link href="/dashboard/library">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-balance">{exercise.title}</h1>
          <p className="text-sm text-muted-foreground">{exercise.category}</p>
        </div>
      </header>

      <div className="space-y-6">
        <div className="relative aspect-video bg-secondary">
          {hasValidVideo ? (
            <img
              src={exercise.videoUrl || "/placeholder.svg"}
              alt={exercise.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Play className="w-16 h-16 text-primary/40 mx-auto" />
                <p className="text-sm text-muted-foreground">Vídeo em breve</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Button size="lg" className="h-16 w-16 rounded-full gold-gradient">
              <Play className="w-8 h-8 text-primary-foreground ml-1" />
            </Button>
          </div>
        </div>

        <div className="px-6 space-y-6">
          <div>
            <p className="text-muted-foreground text-pretty leading-relaxed">{exercise.description}</p>
          </div>

          <Card className="bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Músculos Trabalhados</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {exercise.targetMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Passo a Passo</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {exercise.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm text-pretty leading-relaxed pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card className="bg-card border-destructive/20">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <CardTitle className="text-lg">Erros Comuns</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {exercise.commonErrors.map((error, index) => (
                  <li key={index} className="flex gap-2 text-sm text-pretty">
                    <span className="text-destructive">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Respiração</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-pretty">{exercise.breathing}</p>
            </CardContent>
          </Card>

          <div className="grid gap-3 pt-4">
            <Button className="w-full gold-gradient text-primary-foreground font-semibold h-12">
              <Plus className="mr-2 h-5 w-5" />
              Adicionar ao Treino
            </Button>

            <Button variant="outline" className="w-full h-12 bg-transparent">
              <Volume2 className="mr-2 h-5 w-5" />
              Ouvir Instruções
            </Button>

            <Button variant="outline" className="w-full h-12 bg-transparent">
              Gerar Variação com IA
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
