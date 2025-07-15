"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/auth-helpers-nextjs"
import { getSupabaseClient, isSupabaseConfigured, createMockClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  isConfigured: false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const configured = isSupabaseConfigured()
  const supabase = configured ? getSupabaseClient() : createMockClient()

  useEffect(() => {
    if (!configured) {
      console.warn("Supabase not configured - running in demo mode")
      setLoading(false)
      return
    }

    if (!supabase) {
      setLoading(false)
      return
    }

    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()
          setProfile(profile)
        }
      } catch (error) {
        console.error("Error getting user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        try {
          const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()
          setProfile(profile)
        } catch (error) {
          console.error("Error getting profile:", error)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, configured])

  const signOut = async () => {
    if (!configured || !supabase) return

    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        isConfigured: configured,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
