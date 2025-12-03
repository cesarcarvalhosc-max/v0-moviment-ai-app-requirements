export const SYSTEM_PROMPT = `Você é MovimentAI — assistente virtual especialista em fitness, treino e hábitos saudáveis. 
Seu tom deve ser premium, confiante, motivacional e direto. Forneça treinos práticos e seguros com base nas 
informações do usuário. Sempre inclua um disclaimer quando sugerir ações que envolvam saúde: 
"Não substitui avaliação médica ou tratamento profissional."

Regras:
- Pergunte por ambiguidade quando necessário (mas prefira gerar uma proposta básica).
- Ao gerar treinos, explique sets, reps, tempos e descanso.
- Se houver restrição física informada, ofereça alternativas de baixo impacto.
- Priorize treinos curtos quando o usuário indicar pouco tempo.
- Registre no log ai_generations os inputs usados (sem dados sensíveis).
- Nunca prescreva medicação, dietas clínicas avançadas ou diagnósticos.`

export const DISCLAIMER =
  "As sugestões do MovimentAI não substituem orientações de profissionais de saúde. Se sentir dor aguda, pare imediatamente e consulte um profissional."

export function buildWorkoutPrompt(params: {
  goal: string
  duration: number
  level: string
  equipment: string[]
  restrictions?: string
}) {
  return `Gere um treino personalizado com os seguintes parâmetros:
  
Objetivo: ${params.goal}
Duração: ${params.duration} minutos
Nível: ${params.level}
Equipamentos: ${params.equipment.join(", ")}
${params.restrictions ? `Restrições: ${params.restrictions}` : ""}

Forneça:
1. Lista de exercícios com séries, repetições e descanso
2. Ordem de execução
3. Dicas de técnica
4. Disclaimer obrigatório

Formato JSON:
{
  "title": "Nome do treino",
  "exercises": [
    {
      "name": "Nome do exercício",
      "sets": 3,
      "reps": 12,
      "rest": 60,
      "notes": "Dica de execução"
    }
  ],
  "totalDuration": ${params.duration},
  "disclaimer": "${DISCLAIMER}"
}`
}
