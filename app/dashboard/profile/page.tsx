"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Camera, TrendingUp, Ruler, Weight, Target } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function ProfilePage() {
  const { supabaseUser } = useAuth()
  const [userData, setUserData] = useState({
    name: "Carlos Silva",
    email: "carlos@example.com",
    age: 28,
    height: 175,
    weight: 78,
    goal: "Ganho de massa",
    level: "Intermediário",
  })

  const [measurements, setMeasurements] = useState({
    chest: 95,
    waist: 82,
    hips: 98,
  })

  const [profileImage, setProfileImage] = useState("")
  const [showCropDialog, setShowCropDialog] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
  })
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (supabaseUser) {
      loadProfileData()
    }
  }, [supabaseUser])

  const loadProfileData = async () => {
    if (!supabaseUser) return

    const supabase = createClient()
    const { data } = await supabase.from("profiles").select("*").eq("user_id", supabaseUser.id).single()

    if (data) {
      setUserData({
        name: data.name || "",
        email: supabaseUser.email || "",
        age: data.age || 0,
        height: data.height || 0,
        weight: data.weight || 0,
        goal: data.goal || "",
        level: data.level || "",
      })
      setMeasurements({
        chest: data.chest || 0,
        waist: data.waist || 0,
        hips: data.hips || 0,
      })
      setProfileImage(data.photo_url || "")
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setImageToCrop(reader.result as string)
      setShowCropDialog(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async () => {
    if (!completedCrop || !imageRef.current || !imageToCrop || !supabaseUser) return

    const canvas = document.createElement("canvas")
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height
    canvas.width = completedCrop.width * scaleX
    canvas.height = completedCrop.height * scaleY
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    ctx.drawImage(
      imageRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    )

    canvas.toBlob(async (blob) => {
      if (!blob) return

      const supabase = createClient()
      const fileName = `${supabaseUser.id}-${Date.now()}.jpg`
      const { data: uploadData } = await supabase.storage.from("profile-images").upload(fileName, blob)

      if (uploadData) {
        const { data: urlData } = supabase.storage.from("profile-images").getPublicUrl(fileName)
        const photoUrl = urlData.publicUrl

        await supabase.from("profiles").update({ photo_url: photoUrl }).eq("user_id", supabaseUser.id)

        setProfileImage(photoUrl)
        setShowCropDialog(false)
        setImageToCrop(null)
      }
    }, "image/jpeg")
  }

  const saveProfileData = async () => {
    if (!supabaseUser) return

    const supabase = createClient()
    await supabase
      .from("profiles")
      .update({
        name: userData.name,
        age: userData.age,
        height: userData.height,
        weight: userData.weight,
        goal: userData.goal,
        level: userData.level,
        chest: measurements.chest,
        waist: measurements.waist,
        hips: measurements.hips,
      })
      .eq("user_id", supabaseUser.id)

    alert("Perfil atualizado com sucesso!")
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-6 flex items-center gap-4 border-b border-border">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Perfil</h1>
      </header>

      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarImage src={profileImage || "/diverse-group-athletes.png"} />
              <AvatarFallback>{userData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <label htmlFor="profile-image-upload">
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full gold-gradient p-0 cursor-pointer"
                asChild
              >
                <span>
                  <Camera className="h-4 w-4 text-primary-foreground" />
                </span>
              </Button>
            </label>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold">{userData.name}</h2>
            <p className="text-sm text-muted-foreground">{userData.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-card">
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <Weight className="w-5 h-5 text-primary mb-1" />
              <span className="text-2xl font-bold">{userData.weight}kg</span>
              <span className="text-xs text-muted-foreground">Peso</span>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <Ruler className="w-5 h-5 text-primary mb-1" />
              <span className="text-2xl font-bold">{userData.height}cm</span>
              <span className="text-xs text-muted-foreground">Altura</span>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <Target className="w-5 h-5 text-primary mb-1" />
              <span className="text-sm font-bold">{userData.goal}</span>
              <span className="text-xs text-muted-foreground">Objetivo</span>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <TrendingUp className="w-5 h-5 text-primary mb-1" />
              <span className="text-sm font-bold">{userData.level}</span>
              <span className="text-xs text-muted-foreground">Nível</span>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Medidas Corporais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{measurements.chest}</p>
                <p className="text-xs text-muted-foreground">Peitoral</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{measurements.waist}</p>
                <p className="text-xs text-muted-foreground">Cintura</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{measurements.hips}</p>
                <p className="text-xs text-muted-foreground">Quadril</p>
              </div>
            </div>
            <Button variant="outline" className="w-full bg-transparent">
              Atualizar Medidas
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={userData.age}
                  onChange={(e) => setUserData({ ...userData, age: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={userData.weight}
                  onChange={(e) => setUserData({ ...userData, weight: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            <Button className="w-full gold-gradient text-primary-foreground font-semibold" onClick={saveProfileData}>
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-0">
            <Link
              href="/dashboard/settings/notifications"
              className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <span>Notificações</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </Link>
            <Link
              href="/dashboard/settings/privacy"
              className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-t border-border"
            >
              <span>Privacidade</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </Link>
            <Link
              href="/dashboard/settings/about"
              className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-t border-border"
            >
              <span>Sobre o MovimentAI</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Button variant="ghost" className="w-full text-destructive">
          Sair da Conta
        </Button>
      </div>

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajustar foto de perfil</DialogTitle>
            <DialogDescription>Arraste para ajustar o recorte da sua foto</DialogDescription>
          </DialogHeader>
          {imageToCrop && (
            <div className="space-y-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img ref={imageRef} src={imageToCrop || "/placeholder.svg"} alt="Crop preview" className="max-w-full" />
              </ReactCrop>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCropDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCropComplete} className="gold-gradient text-primary-foreground">
                  Salvar foto
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
