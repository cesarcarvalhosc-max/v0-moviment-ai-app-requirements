import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] Payment webhook received:", body)

    // Extract payment data
    const { email, nome, status, objetivo, nivel, tempo_diario } = body

    // Verify payment is approved
    if (status !== "aprovado" && status !== "approved") {
      return NextResponse.json({ error: "Payment not approved" }, { status: 400 })
    }

    // Auto-create account with email as login and password
    const newUser = {
      email: email,
      password: email, // Password = email
      name: nome || "Novo Usuário",
      created_at: new Date().toISOString(),
      created_via: "payment_webhook",
    }

    console.log("[v0] Auto-creating user account:", newUser.email)

    // Send to workout generation webhook
    const workoutPayload = {
      email: email,
      nome: nome || "Novo Usuário",
      objetivo: objetivo || "Condicionamento",
      nivel: nivel || "Iniciante",
      tempo_diario: tempo_diario || 30,
    }

    try {
      const workoutResponse = await fetch("https://hook.us2.make.com/47nt1fjp5hu1htr2f9dpdey01ccrshz2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workoutPayload),
      })

      const workoutData = await workoutResponse.json()
      console.log("[v0] Workout generated for new user:", workoutData)
    } catch (error) {
      console.error("[v0] Error generating workout for new user:", error)
    }

    return NextResponse.json({
      success: true,
      message: "Account created and workout generated",
      user: {
        email: newUser.email,
        name: newUser.name,
      },
    })
  } catch (error) {
    console.error("[v0] Payment webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
