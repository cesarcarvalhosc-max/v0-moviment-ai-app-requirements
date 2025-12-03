"use client"

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("[v0] Notifications not supported")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return false
}

export const showNotification = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    const motivationalPhrases = [
      "Você consegue! 💪",
      "Hora de brilhar! ✨",
      "Seu corpo agradece! 🔥",
      "Vamos nessa! 🚀",
      "Seja disciplinado! ⚡",
      "A consistência é a chave! 🎯",
    ]

    const randomPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]

    new Notification(title, {
      body: `${body}\n\n${randomPhrase}`,
      icon: "/icon-dark-32x32.png",
      badge: "/icon-dark-32x32.png",
      tag: "movimentai-workout",
      requireInteraction: false,
    })
  }
}

export const scheduleWorkoutNotification = (workoutTitle: string, scheduledTime: Date) => {
  const now = new Date().getTime()
  const scheduledTimeMs = scheduledTime.getTime()
  const delay = scheduledTimeMs - now

  if (delay > 0) {
    setTimeout(() => {
      showNotification("Hora do Treino! 🏋️", `Seu treino "${workoutTitle}" está agendado para agora.`)
    }, delay)

    console.log("[v0] Notification scheduled for:", scheduledTime)
  }
}
