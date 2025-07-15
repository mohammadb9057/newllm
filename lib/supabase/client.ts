import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "./types"

// Check if Supabase environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

export const createClient = () => {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase environment variables not configured")
    // Return a mock client for development/preview
    return null
  }

  return createClientComponentClient<Database>()
}

// Singleton pattern for client-side Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}

// Mock client for when Supabase is not configured
export const createMockClient = () => ({
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: null, error: { message: "Supabase not configured" } }),
    signUp: async () => ({ data: null, error: { message: "Supabase not configured" } }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
    insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
    update: () => ({ eq: async () => ({ data: null, error: null }) }),
    delete: () => ({ eq: async () => ({ data: null, error: null }) }),
  }),
  rpc: async () => ({ data: null, error: null }),
})
