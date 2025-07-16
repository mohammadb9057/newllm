import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { APIClient } from "@/lib/api-client" // Import APIClient

// Initialize Supabase client for server-side operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

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

    // Initialize APIClient with LLM7_API_KEY
    const llm7ApiKey = process.env.LLM7_API_KEY
    if (!llm7ApiKey) {
      console.error("LLM7_API_KEY is not set in environment variables.")
      return NextResponse.json({ error: "Server configuration error: LLM API key missing." }, { status: 500 })
    }
    const llm7ApiClient = new APIClient("https://api.llm7.io/v1", llm7ApiKey)

    // Fetch models from LLM7.io
    const llm7Models = await llm7ApiClient.getModels()

    // Filter and map models to a more user-friendly format if needed
    // For now, we'll just return them directly, assuming LLM7.io returns suitable data
    const availableModels = llm7Models.map((model) => ({
      id: model.id,
      name: model.id, // Use ID as name for simplicity, or map to a more descriptive name if LLM7.io provides one
      description: `مدل ارائه شده توسط ${model.owned_by}`,
      max_tokens: 4096, // Placeholder, LLM7.io might provide this
      cost_per_token: 0.01, // Placeholder, LLM7.io might provide this
      owned_by: model.owned_by, // Include owned_by for display in UI
    }))

    // Return available models and user info
    return NextResponse.json({
      models: availableModels,
      user_info: {
        tokens_used: user.tokens_used,
        tokens_limit: user.tokens_limit,
        remaining_tokens: user.tokens_limit - user.tokens_used,
      },
      success: true,
    })
  } catch (error) {
    console.error("Models API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
