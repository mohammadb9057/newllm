import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// LLM7.io configuration (hidden from client)
const LLM7_API_URL = "https://api.llm7.io/v1/chat/completions"
const LLM7_API_KEY = process.env.LLM7_API_KEY || "your-llm7-api-key-here"

interface ChatRequest {
  message: string
  model?: string
  temperature?: number
  max_tokens?: number
}

interface LLM7Response {
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function POST(request: NextRequest) {
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
      .select("*")
      .eq("api_token", token)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check if user has remaining tokens
    if (user.tokens_used >= user.tokens_limit) {
      return NextResponse.json({ 
        error: "Token limit exceeded", 
        tokens_used: user.tokens_used,
        tokens_limit: user.tokens_limit 
      }, { status: 429 })
    }

    // Parse request body
    const body: ChatRequest = await request.json()
    
    if (!body.message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Prepare request to LLM7.io (completely hidden from client)
    const llm7Request = {
      model: body.model || "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: body.message
        }
      ],
      temperature: body.temperature || 0.7,
      max_tokens: body.max_tokens || 1000
    }

    // Make request to LLM7.io
    const llm7Response = await fetch(LLM7_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LLM7_API_KEY}`
      },
      body: JSON.stringify(llm7Request)
    })

    if (!llm7Response.ok) {
      console.error("LLM7.io API error:", await llm7Response.text())
      return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 503 })
    }

    const llm7Data: LLM7Response = await llm7Response.json()
    
    if (!llm7Data.choices || llm7Data.choices.length === 0) {
      return NextResponse.json({ error: "No response from AI service" }, { status: 500 })
    }

    const aiResponse = llm7Data.choices[0].message.content
    const tokensUsed = llm7Data.usage?.total_tokens || 10 // Fallback if usage not provided

    // Update user's token usage
    const newTokensUsed = user.tokens_used + tokensUsed
    await supabase
      .from("users")
      .update({ tokens_used: newTokensUsed })
      .eq("id", user.id)

    // Store conversation in database
    await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        message: body.message,
        response: aiResponse,
        model: body.model || "gpt-3.5-turbo",
        tokens_used: tokensUsed,
        created_at: new Date().toISOString()
      })

    // Return response (no mention of LLM7.io)
    return NextResponse.json({
      response: aiResponse,
      model: body.model || "gpt-3.5-turbo",
      tokens_used: tokensUsed,
      remaining_tokens: user.tokens_limit - newTokensUsed,
      success: true
    })

  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Persian LLM Chat API",
    version: "1.0.0",
    endpoints: {
      chat: "POST /api/llm/chat",
      models: "GET /api/llm/models"
    },
    authentication: "Bearer token required"
  })
}

