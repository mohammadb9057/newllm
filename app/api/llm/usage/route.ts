import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
      .select("id, name, email, tokens_used, tokens_limit, created_at")
      .eq("api_token", token)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get recent conversations
    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select("created_at, tokens_used, model")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    // Calculate usage statistics
    const totalConversations = conversations?.length || 0
    const recentUsage = conversations?.reduce((sum, conv) => sum + (conv.tokens_used || 0), 0) || 0
    
    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        member_since: user.created_at
      },
      usage: {
        tokens_used: user.tokens_used,
        tokens_limit: user.tokens_limit,
        remaining_tokens: user.tokens_limit - user.tokens_used,
        usage_percentage: Math.round((user.tokens_used / user.tokens_limit) * 100),
        total_conversations: totalConversations,
        recent_usage: recentUsage
      },
      recent_conversations: conversations?.map(conv => ({
        date: conv.created_at,
        tokens_used: conv.tokens_used,
        model: conv.model
      })) || [],
      success: true
    })

  } catch (error) {
    console.error("Usage API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

