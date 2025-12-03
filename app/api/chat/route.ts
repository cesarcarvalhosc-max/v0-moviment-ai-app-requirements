import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const GEMINI_API_KEY = "AIzaSyCl89wsMukPi0oG64_qmQfbEpHS9aD9ECU"
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

const MARI_SYSTEM_PROMPT = `Você é MARI, a assistente de fitness do app MovimentAI.

PERSONALIDADE:
- Motivadora, enérgica e positiva
- Use emojis ocasionalmente mas sem exagero
- Seja direta e objetiva
- Celebre conquistas dos usuários

FUNCIONALIDADES DO APP:
1. **Treinos**: Criar com IA ou manual, biblioteca de treinos, treino do dia
2. **Dashboard**: Água, hábitos, progresso semanal, mindfulness
3. **Calendário**: Histórico de treinos
4. **Perfil**: Editar dados, foto, medidas corporais
5. **Biblioteca**: +50 exercícios com vídeos e instruções

RESPONDA SOBRE:
- Criação e ajuste de treinos
- Nutrição básica (avise para consultar nutricionista para planos personalizados)
- Tempo de descanso entre séries
- Mindfulness e meditação
- Acompanhamento de progresso
- Motivação e dicas de consistência

NUNCA:
- Diagnostique lesões ou problemas médicos
- Prescreva medicamentos
- Dê orientações nutricionais muito específicas sem avisar sobre nutricionista

Seja sempre útil e direcione o usuário para as funcionalidades certas do app!`

async function getGeminiResponse(message: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: MARI_SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido! Sou a MARI, assistente de fitness do MovimentAI. Como posso ajudar você hoje?" }],
        },
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    })

    return response.text || null
  } catch (error) {
    console.error("[v0] Gemini API error:", error)
    return null
  }
}

const LOCAL_AI_RESPONSES: Record<string, string> = {
  "criar treino": `Ótimo! Vou te ajudar a criar um treino personalizado.

Para criar um treino você pode:

1. **Gerar com IA**: Vá em Treinos > Gerar com IA e preencha suas preferências
2. **Criar Manual**: Vá em Treinos > Criar Manual e escolha seus exercícios

Qual opção prefere?`,

  "ajustar treino": `Para ajustar seu treino atual:

1. Acesse "Treinos" no menu
2. Veja seu "Próximo Treino"
3. Clique no treino para editá-lo

Ou posso sugerir ajustes. Qual parte do treino você quer modificar?`,

  nutrição: `Sobre nutrição, aqui vão algumas dicas gerais:

• **Hidratação**: Beba pelo menos 2L de água por dia
• **Proteínas**: Consuma cerca de 1,6-2,2g por kg de peso corporal
• **Pré-treino**: Carboidratos 30-60min antes
• **Pós-treino**: Proteína + carboidrato nas primeiras 2h

⚠️ Para orientações personalizadas, consulte um nutricionista!`,

  descanso: `O tempo de descanso ideal varia:

• **Força**: 2-5 minutos entre séries
• **Hipertrofia**: 1-2 minutos
• **Resistência**: 30-60 segundos
• **HIIT**: 15-30 segundos

Seu treino atual já inclui cronômetros automáticos!`,

  mindfulness: `Para praticar mindfulness:

1. Vá em Dashboard
2. Role até "Mindfulness"
3. Ative a opção
4. Acesse vídeos guiados de meditação

Benefícios: reduz stress, melhora foco e recuperação muscular!`,

  progresso: `Para ver seu progresso:

• **Dashboard**: Veja gráficos de evolução semanal
• **Calendário**: Histórico de treinos concluídos
• **Perfil**: Medidas corporais e metas

Continue assim! A consistência é a chave! 💪`,
}

function findBestResponse(message: string): string | null {
  const normalizedMessage = message.toLowerCase()

  for (const [key, response] of Object.entries(LOCAL_AI_RESPONSES)) {
    if (normalizedMessage.includes(key)) {
      return response
    }
  }

  return null
}

async function tryWebhookSilently(body: any): Promise<{ success: boolean; data?: any }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch("https://cpuz2206.app.n8n.cloud/webhook-test/chat-webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId))

    if (response.ok) {
      const data = await response.json()
      return { success: true, data }
    }

    return { success: false }
  } catch {
    // Silently fail without any logging
    return { success: false }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userMessage = body.mensagem || body.message

    if (!userMessage) {
      return NextResponse.json({
        success: false,
        error: "Mensagem não fornecida",
      })
    }

    const geminiResponse = await getGeminiResponse(userMessage)

    if (geminiResponse) {
      return NextResponse.json({
        success: true,
        response: geminiResponse,
        source: "gemini",
      })
    }

    return NextResponse.json({
      success: true,
      response: `Olá! Sou a MARI, sua assistente de fitness! 💪

Posso te ajudar com:
• Criar treinos personalizados
• Ajustar seu calendário de treinos
• Acessar biblioteca de exercícios (+50 exercícios)
• Configurar mindfulness e meditação
• Ver seu progresso e evolução

O que você gostaria de fazer hoje?`,
      source: "local",
    })
  } catch (error) {
    console.error("[v0] Error in chat route:", error)

    return NextResponse.json({
      success: true,
      response: `Oi! Tive um pequeno problema técnico, mas estou aqui! 🌟

Como posso te ajudar? Posso auxiliar com:
- Treinos e exercícios
- Nutrição básica
- Acompanhamento de progresso
- Motivação e dicas

Me conte o que você precisa!`,
      source: "local",
    })
  }
}
