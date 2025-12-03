"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

type User = {
  id: string
  name: string
  email: string
  profilePhoto?: string
}

type AuthContextType = {
  user: User | null
  supabaseUser: SupabaseUser | null
  logout: () => Promise<void>
  isAuthenticated: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const supabase = createClient()

  const refreshUser = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        // Clear invalid session
        await supabase.auth.signOut()
        setUser(null)
        setSupabaseUser(null)
        return
      }

      const authUser = session.user

      if (authUser) {
        setSupabaseUser(authUser)

        // Fetch profile data
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle()

        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name || authUser.email?.split("@")[0] || "Usuário",
            email: profile.email,
            profilePhoto: profile.profile_photo,
          })
        }
      } else {
        setUser(null)
        setSupabaseUser(null)
      }
    } catch (error) {
      console.error("[v0] Auth error:", error)
      await supabase.auth.signOut()
      setUser(null)
      setSupabaseUser(null)
    }
  }

  useEffect(() => {
    // Initial user check
    refreshUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        refreshUser()
      } else {
        setUser(null)
        setSupabaseUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        logout,
        isAuthenticated: !!user,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
