import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Available models (mapped from LLM7.io but presented as our own)
const AVAILABLE_MODELS = [
  {
    id: "gpt-4",
    name: "GPT-4 Persian",
    description: "مدل پیشرفته برای پاسخ‌های دقیق و خلاقانه",
    max_tokens: 4096,
    cost_per_token: 0.03
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "مدل سریع و کارآمد برای استفاده روزمره",
    max_tokens: 2048,
    cost_per_token: 0.01
  },
  {
    id: "claude-3",
    name: "Claude-3 Persian",
    description: "مدل قدرتمند برای تحلیل و استدلال پیچیده",
    max_tokens: 8192,
    cost_per_token: 0.025
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    description: "مدل چندمنظوره برای انواع وظایف",
    max_tokens: 2048,
    cost_per_token: 0.015
  }
]

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix

    // Verify token and get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, tokens_used, tokens_limit")
      .eq("api_token", token)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Return available models
    return NextResponse.json({
      models: AVAILABLE_MODELS,
      user_info: {
        tokens_used: user.tokens_used,
        tokens_limit: user.tokens_limit,
        remaining_tokens: user.tokens_limit - user.tokens_used
      },
      success: true
    })

  } catch (error) {
    console.error("Models API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

