import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, goal, duration, intensity, equipment, restrictions } = body

    // System prompt for AI
    const systemPrompt = `Você é MovimentAI — assistente virtual especialista em fitness, treino e hábitos saudáveis. 
    Seu tom deve ser premium, confiante, motivacional e direto. Forneça treinos práticos e seguros com base nas 
    informações do usuário. Sempre inclua disclaimer: "Não substitui avaliação médica ou tratamento profissional."
    
    Regras:
    - Pergunte por ambiguidade quando necessário (mas prefira gerar uma proposta básica).
    - Ao gerar treinos, explique sets, reps, tempos e descanso.
    - Se houver restrição física informada, ofereça alternativas de baixo impacto.
    - Priorize treinos curtos quando o usuário indicar pouco tempo.
    - Nunca prescreva medicação, dietas clínicas avançadas ou diagnósticos.`

    // In production, this would call OpenAI/Anthropic API
    // For now, return mock data
    const mockWorkout = {
      id: `workout_${Date.now()}`,
      title: `Treino ${goal} - ${duration}min`,
      duration: Number.parseInt(duration),
      intensity,
      exercises: [
        {
          id: "chest-1",
          title: "Flexão clássica",
          sets: 3,
          reps: 12,
          rest: 60,
          notes: "Mantenha o core contraído durante todo o movimento",
        },
        {
          id: "chest-2",
          title: "Flexão diamante",
          sets: 3,
          reps: 10,
          rest: 60,
          notes: "Foque na contração do tríceps",
        },
      ],
      disclaimer:
        "Este treino é uma sugestão automatizada e não substitui avaliação médica ou de um profissional de educação física.",
      createdAt: new Date().toISOString(),
    }

    // Log generation for audit
    const logEntry = {
      userId,
      workoutId: mockWorkout.id,
      model: "gpt-4",
      inputs: { goal, duration, intensity, equipment, restrictions },
      timestamp: new Date().toISOString(),
    }

    console.log("[AI Generation Log]", logEntry)

    return NextResponse.json(mockWorkout)
  } catch (error) {
    console.error("Error generating workout:", error)
    return NextResponse.json({ error: "Failed to generate workout" }, { status: 500 })
  }
}
