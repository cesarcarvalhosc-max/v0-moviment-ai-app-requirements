"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Search, Play } from "lucide-react"
import { EXERCISES, CATEGORIES } from "@/lib/exercises-data"
import { cn } from "@/lib/utils"

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredExercises = EXERCISES.filter((exercise) => {
    const matchesSearch =
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Biblioteca de Exercícios</h1>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar exercícios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className={cn(selectedCategory === "all" && "gold-gradient text-primary-foreground")}
          >
            Todos
          </Button>
          {CATEGORIES.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "whitespace-nowrap",
                selectedCategory === category && "gold-gradient text-primary-foreground",
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid gap-4">
          {filteredExercises.map((exercise) => {
            const hasValidVideo =
              exercise.videoUrl && exercise.videoUrl.trim() !== "" && !exercise.videoUrl.includes("placeholder.svg")

            return (
              <Link key={exercise.id} href={`/dashboard/library/${exercise.id}`}>
                <Card className="overflow-hidden hover:scale-[1.01] transition-transform active:scale-[0.99] cursor-pointer">
                  <div className="flex gap-4">
                    {/* Video thumbnail */}
                    <div className="relative w-32 h-32 flex-shrink-0 bg-secondary">
                      {hasValidVideo ? (
                        <img
                          src={exercise.videoUrl || "/placeholder.svg"}
                          alt={exercise.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Play className="w-12 h-12 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                          <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="flex-1 py-3 pr-4 pl-0">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-pretty leading-tight">{exercise.title}</h3>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap">
                            {exercise.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 text-pretty">{exercise.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {exercise.targetMuscles.slice(0, 2).map((muscle) => (
                            <span key={muscle} className="text-xs text-muted-foreground">
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum exercício encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}
