"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Video, Users, Activity, Settings, BarChart3, FileVideo } from "lucide-react"
import { EXERCISES } from "@/lib/exercises-data"

export default function AdminPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleVideoUpload = () => {
    if (!selectedFile) return
    // Simulate upload
    alert(`Upload iniciado: ${selectedFile.name}`)
    setSelectedFile(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">MovimentAI</p>
              </div>
            </div>
            <Button variant="outline">Sair</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuários Ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">1,234</p>
              <p className="text-xs text-muted-foreground mt-1">+12% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Treinos Gerados (IA)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">5,678</p>
              <p className="text-xs text-muted-foreground mt-1">+23% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Vídeos na Biblioteca
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{EXERCISES.length}</p>
              <p className="text-xs text-muted-foreground mt-1">27 exercícios totais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Engajamento Médio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">4.2x</p>
              <p className="text-xs text-muted-foreground mt-1">Treinos/semana</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="exercises" className="space-y-6">
          <TabsList>
            <TabsTrigger value="exercises">Exercícios</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="ai-logs">Logs IA</TabsTrigger>
          </TabsList>

          <TabsContent value="exercises" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Exercícios</CardTitle>
                <CardDescription>Adicione, edite ou remova exercícios da biblioteca</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {EXERCISES.slice(0, 5).map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{exercise.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {exercise.category} • {exercise.targetMuscles.join(", ")}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">
                  <Upload className="mr-2 h-4 w-4" />
                  Adicionar Novo Exercício
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload e Substituição de Vídeos</CardTitle>
                <CardDescription>Gerencie vídeos dos exercícios com controle de versão</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="exercise-select">Selecione o Exercício</Label>
                    <select
                      id="exercise-select"
                      className="w-full h-10 px-3 rounded-lg bg-input border border-border text-foreground"
                    >
                      <option value="">Escolha um exercício...</option>
                      {EXERCISES.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.title} ({ex.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video-upload">Upload de Vídeo</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <input
                        id="video-upload"
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="video-upload" className="cursor-pointer">
                        <FileVideo className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        {selectedFile ? (
                          <div>
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">Clique para selecionar</p>
                            <p className="text-sm text-muted-foreground mt-1">MP4 ou WebM, até 500MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  <Button
                    onClick={handleVideoUpload}
                    disabled={!selectedFile}
                    className="w-full gold-gradient text-primary-foreground font-semibold"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload e Transcodificar
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold mb-3">Histórico de Versões</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Versão 3 (Ativa)</p>
                        <p className="text-xs text-muted-foreground">Enviado em 01/12/2025 por admin_02</p>
                      </div>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">Ativa</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Versão 2</p>
                        <p className="text-xs text-muted-foreground">Enviado em 15/11/2025 por admin_01</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Restaurar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Usuários</CardTitle>
                <CardDescription>Gerencie usuários da plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">Tabela de usuários será implementada aqui</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-logs">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Geração IA</CardTitle>
                <CardDescription>Auditoria de treinos gerados pela assistente</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">Logs de IA serão exibidos aqui</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
