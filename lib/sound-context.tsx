"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type SoundContextType = {
  soundEnabled: boolean
  toggleSound: () => void
  playClickSound: () => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  useEffect(() => {
    // Load sound preference from localStorage
    const savedPref = localStorage.getItem("movimentai_sound")
    if (savedPref !== null) {
      setSoundEnabled(savedPref === "true")
    }

    // Initialize Web Audio API
    if (typeof window !== "undefined") {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioContext(ctx)
    }
  }, [])

  const toggleSound = () => {
    const newValue = !soundEnabled
    setSoundEnabled(newValue)
    localStorage.setItem("movimentai_sound", String(newValue))
    console.log("[v0] Sound toggled:", newValue ? "ON" : "OFF")
  }

  const playClickSound = () => {
    if (!soundEnabled || !audioContext) return

    try {
      // Create a short, subtle click sound
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.error("[v0] Error playing sound:", error)
    }
  }

  return <SoundContext.Provider value={{ soundEnabled, toggleSound, playClickSound }}>{children}</SoundContext.Provider>
}

export function useSound() {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error("useSound must be used within SoundProvider")
  }
  return context
}
