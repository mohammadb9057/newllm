import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { Database } from "./supabase/types"

export async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Get user profile from our users table
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return { ...user, profile }
}

export async function requireAuth() {
  const user = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return user
}

export async function requireAdmin() {
  const user = await requireAuth()

  if (!user.profile?.is_admin) {
    redirect("/dashboard")
  }

  return user
}
