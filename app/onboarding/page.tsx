"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth-context"

type OnboardingData = {
  name: string
  age: string
  gender: string
  height: string
  weight: string
  goal: string
  timeAvailable: string
  equipment: string[]
  level: string
  restrictions: string
  measurements: {
    chest?: string
    waist?: string
    hips?: string
  }
}

const STEPS = ["Bem-vindo", "Conta", "Objetivo", "Tempo", "Equipamentos", "Nível", "Restrições", "Medidas", "Pronto"]

export default function OnboardingPage() {
  const router = useRouter()
  const { supabaseUser, refreshUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<OnboardingData>({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
    timeAvailable: "",
    equipment: [],
    level: "",
    restrictions: "",
    measurements: {},
  })

  const progress = ((currentStep + 1) / STEPS.length) * 100

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!supabaseUser) {
        router.push("/login")
        return
      }

      const supabase = createClient()

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", supabaseUser.id)
          .maybeSingle()

        if (profile?.onboarding_completed) {
          router.push("/dashboard")
        } else if (!profile) {
          await supabase.from("profiles").insert({
            id: supabaseUser.id,
            email: supabaseUser.email,
            onboarding_completed: false,
          })
        }
      } catch (error) {
        console.error("[v0] Error checking onboarding:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [supabaseUser, router])

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsLoading(true)
      try {
        const supabase = createClient()

        if (!supabaseUser) {
          throw new Error("User not authenticated")
        }

        const { error } = await supabase
          .from("profiles")
          .update({
            name: data.name,
            age: Number.parseInt(data.age) || null,
            gender: data.gender,
            height: Number.parseFloat(data.height) || null,
            weight: Number.parseFloat(data.weight) || null,
            goal: data.goal,
            available_time: Number.parseInt(data.timeAvailable) || null,
            equipment: data.equipment,
            level: data.level,
            restrictions: data.restrictions ? [data.restrictions] : [],
            measurements: data.measurements,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", supabaseUser.id)

        if (error) throw error

        const { data: existingHabits } = await supabase.from("habits").select("id").eq("user_id", supabaseUser.id)

        if (!existingHabits || existingHabits.length === 0) {
          await supabase.from("habits").insert([
            { user_id: supabaseUser.id, name: "Beber água", icon: "💧" },
            { user_id: supabaseUser.id, name: "Dormir bem", icon: "😴" },
            { user_id: supabaseUser.id, name: "Fazer treino", icon: "💪" },
            { user_id: supabaseUser.id, name: "Comer saudável", icon: "🥗" },
          ])
        }

        await refreshUser()

        router.push("/dashboard")
      } catch (error) {
        console.error("[v0] Onboarding save error:", error)
        alert("Erro ao salvar dados. Tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const selectOption = (field: keyof OnboardingData, value: string) => {
    setData({ ...data, [field]: value })
  }

  const toggleEquipment = (equipment: string) => {
    const current = data.equipment || []
    if (current.includes(equipment)) {
      setData({ ...data, equipment: current.filter((e) => e !== equipment) })
    } else {
      setData({ ...data, equipment: [...current, equipment] })
    }
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="w-full bg-secondary/50">
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      <div className="p-4 flex items-center justify-between">
        {currentStep > 0 && (
          <Button variant="ghost" size="sm" onClick={handleBack} disabled={isLoading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        )}
        <div className="text-sm text-muted-foreground ml-auto">
          {currentStep + 1} de {STEPS.length}
        </div>
      </div>

      <div className="flex-1 px-6 pb-24 overflow-y-auto">
        {currentStep === 0 && <StepWelcome data={data} setData={setData} />}
        {currentStep === 1 && <StepAccount data={data} setData={setData} />}
        {currentStep === 2 && <StepGoal data={data} selectOption={selectOption} />}
        {currentStep === 3 && <StepTime data={data} selectOption={selectOption} />}
        {currentStep === 4 && <StepEquipment data={data} toggleEquipment={toggleEquipment} />}
        {currentStep === 5 && <StepLevel data={data} selectOption={selectOption} />}
        {currentStep === 6 && <StepRestrictions data={data} setData={setData} />}
        {currentStep === 7 && <StepMeasurements data={data} setData={setData} />}
        {currentStep === 8 && <StepReady />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full gold-gradient text-primary-foreground font-semibold h-14 text-base"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : currentStep === STEPS.length - 1 ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Gerar Plano Inicial
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function StepWelcome({ data, setData }: any) {
  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-balance">
          Bem-vindo ao Moviment<span className="text-primary">AI</span>
        </h1>
        <p className="text-muted-foreground text-lg text-pretty">
          Vamos criar um plano de treino personalizado para você em poucos minutos.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Como você se chama?</Label>
          <Input
            id="name"
            placeholder="Seu nome"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="h-12"
          />
        </div>
      </div>
    </div>
  )
}

function StepAccount({ data, setData }: any) {
  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-balance">Informações básicas</h2>
        <p className="text-muted-foreground text-pretty">Precisamos de alguns dados para personalizar seus treinos.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              type="number"
              placeholder="25"
              value={data.age}
              onChange={(e) => setData({ ...data, age: e.target.value })}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Sexo</Label>
            <select
              id="gender"
              value={data.gender}
              onChange={(e) => setData({ ...data, gender: e.target.value })}
              className="w-full h-12 px-3 rounded-lg bg-input border border-border text-foreground"
            >
              <option value="">Selecione</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
              <option value="other">Outro</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="170"
              value={data.height}
              onChange={(e) => setData({ ...data, height: e.target.value })}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="70"
              value={data.weight}
              onChange={(e) => setData({ ...data, weight: e.target.value })}
              className="h-12"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StepGoal({ data, selectOption }: any) {
  const goals = [
    { value: "fat-loss", label: "Perda de gordura", emoji: "🔥" },
    { value: "muscle-gain", label: "Ganho de massa", emoji: "💪" },
    { value: "maintenance", label: "Manutenção", emoji: "⚖️" },
    { value: "conditioning", label: "Condicionamento", emoji: "🏃" },
    { value: "consistency", label: "Apenas constância", emoji: "✨" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-balance">Qual seu objetivo?</h2>
        <p className="text-muted-foreground text-pretty">Escolha o objetivo principal para seus treinos.</p>
      </div>

      <div className="grid gap-3">
        {goals.map((goal) => (
          <Card
            key={goal.value}
            onClick={() => selectOption("goal", goal.value)}
            className={cn(
              "p-5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
              data.goal === goal.value ? "premium-card" : "bg-card border-border hover:border-primary/50",
            )}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{goal.emoji}</span>
              <span className="text-lg font-medium">{goal.label}</span>
              {data.goal === goal.value && <Check className="ml-auto h-5 w-5 text-primary" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function StepTime({ data, selectOption }: any) {
  const times = [
    { value: "5", label: "5 minutos" },
    { value: "10", label: "10 minutos" },
    { value: "20", label: "20 minutos" },
    { value: "30", label: "30 minutos" },
    { value: "45", label: "45+ minutos" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-balance">Tempo disponível</h2>
        <p className="text-muted-foreground text-pretty">Quanto tempo você tem por dia para treinar?</p>
      </div>

      <div className="grid gap-3">
        {times.map((time) => (
          <Card
            key={time.value}
            onClick={() => selectOption("timeAvailable", time.value)}
            className={cn(
              "p-5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
              data.timeAvailable === time.value ? "premium-card" : "bg-card border-border hover:border-primary/50",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">{time.label}</span>
              {data.timeAvailable === time.value && <Check className="h-5 w-5 text-primary" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function StepEquipment({ data, toggleEquipment }: any) {
  const equipment = [
    { value: "none", label: "Nenhum (peso corporal)", emoji: "🤸" },
    { value: "dumbbells", label: "Halteres", emoji: "🏋️" },
    { value: "bands", label: "Elásticos", emoji: "🎯" },
    { value: "gym", label: "Academia completa", emoji: "🏢" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-balance">Equipamentos</h2>
        <p className="text-muted-foreground text-pretty">
          Quais equipamentos você tem disponível? Pode selecionar mais de um.
        </p>
      </div>

      <div className="grid gap-3">
        {equipment.map((item) => (
          <Card
            key={item.value}
            onClick={() => toggleEquipment(item.value)}
            className={cn(
              "p-5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
              data.equipment?.includes(item.value) ? "premium-card" : "bg-card border-border hover:border-primary/50",
            )}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-lg font-medium">{item.label}</span>
              {data.equipment?.includes(item.value) && <Check className="ml-auto h-5 w-5 text-primary" />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function StepLevel({ data, selectOption }: any) {
  const levels = [
    {
      value: "beginner",
      label: "Iniciante",
      description: "Pouca ou nenhuma experiência com treinos",
    },
    {
      value: "intermediate",
      label: "Intermediário",
      description: "Treino regularmente há alguns meses",
    },
    {
      value: "advanced",
      label: "Avançado",
      description: "Treino consistente há mais de um ano",
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-balance">Seu nível</h2>
        <p className="text-muted-foreground text-pretty">Qual sua experiência com treinos?</p>
      </div>

      <div className="grid gap-3">
        {levels.map((level) => (
          <Card
            key={level.value}
            onClick={() => selectOption("level", level.value)}
            className={cn(
              "p-5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
              data.level === level.value ? "premium-card" : "bg-card border-border hover:border-primary/50",
            )}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">{level.label}</span>
                {data.level === level.value && <Check className="h-5 w-5 text-primary" />}
              </div>
              <p className="text-sm text-muted-foreground">{level.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function StepRestrictions({ data, setData }: any) {
  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-balance">Restrições físicas</h2>
        <p className="text-muted-foreground text-pretty">
          Tem alguma lesão ou restrição física que devemos considerar?
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="restrictions">Descreva suas restrições (opcional)</Label>
          <textarea
            id="restrictions"
            placeholder="Ex: dor no joelho direito, lesão no ombro..."
            value={data.restrictions}
            onChange={(e) => setData({ ...data, restrictions: e.target.value })}
            className="w-full min-h-32 p-3 rounded-lg bg-input border border-border text-foreground resize-none"
          />
        </div>

        <Card className="p-4 bg-primary/10 border-primary/20">
          <p className="text-sm text-pretty leading-relaxed">
            <strong className="text-primary">Importante:</strong> As sugestões do MovimentAI não substituem orientações
            de profissionais de saúde. Consulte sempre um médico ou fisioterapeuta em caso de lesões ou dores
            persistentes.
          </p>
        </Card>
      </div>
    </div>
  )
}

function StepMeasurements({ data, setData }: any) {
  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-balance">Medidas corporais</h2>
        <p className="text-muted-foreground text-pretty">Opcional: adicione suas medidas para acompanhar a evolução.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chest">Peitoral (cm)</Label>
          <Input
            id="chest"
            type="number"
            placeholder="90"
            value={data.measurements.chest || ""}
            onChange={(e) =>
              setData({
                ...data,
                measurements: { ...data.measurements, chest: e.target.value },
              })
            }
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waist">Cintura (cm)</Label>
          <Input
            id="waist"
            type="number"
            placeholder="80"
            value={data.measurements.waist || ""}
            onChange={(e) =>
              setData({
                ...data,
                measurements: { ...data.measurements, waist: e.target.value },
              })
            }
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hips">Quadril (cm)</Label>
          <Input
            id="hips"
            type="number"
            placeholder="95"
            value={data.measurements.hips || ""}
            onChange={(e) =>
              setData({
                ...data,
                measurements: { ...data.measurements, hips: e.target.value },
              })
            }
            className="h-12"
          />
        </div>

        <p className="text-sm text-muted-foreground text-pretty">
          Você poderá adicionar fotos e mais medidas depois no seu perfil.
        </p>
      </div>
    </div>
  )
}

function StepReady() {
  return (
    <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 text-center py-12">
      <div className="space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full gold-gradient flex items-center justify-center">
          <Check className="w-10 h-10 text-primary-foreground" />
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-balance">Tudo pronto!</h2>
          <p className="text-muted-foreground text-lg text-pretty max-w-md mx-auto">
            Vamos gerar seu plano personalizado de treinos com base nas suas informações.
          </p>
        </div>
      </div>

      <div className="grid gap-4 max-w-md mx-auto text-left">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">Treinos personalizados para seu objetivo e tempo disponível</p>
        </div>
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">Biblioteca de exercícios com vídeos demonstrativos</p>
        </div>
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">Assistente de IA 24/7 para dúvidas e ajustes</p>
        </div>
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">Acompanhamento de progresso e hábitos diários</p>
        </div>
      </div>
    </div>
  )
}
