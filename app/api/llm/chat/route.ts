import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/types"
import { APIClient } from "@/lib/api-client" // Import APIClient

const API_BASE_URL = "https://api.llm7.io/v1"
const LLM7_API_KEY = process.env.LLM7_API_KEY || "your-llm7-api-key-here"

interface ChatRequest {
  message: string
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
  agent_id?: string
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
  const startTime = Date.now()

  try {
    const body: ChatRequest = await request.json()
    const { message, model, temperature = 0.7, max_tokens = 1000, stream = false, agent_id } = body

    // Create Supabase client for this request
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    })

    // Get user from Authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Find user by API token using the database function
    const { data: userProfile, error: userError } = await supabase.rpc("get_user_by_api_token", { token })

    if (userError || !userProfile) {
      console.error("User lookup error:", userError)
      await logRequest(supabase, null, request, body, 401, "Invalid API token", Date.now() - startTime)
      return NextResponse.json({ error: "Invalid API token" }, { status: 401 })
    }

    // Check token usage limits
    if (userProfile.tokens_used >= userProfile.tokens_limit) {
      await logRequest(supabase, userProfile.id, request, body, 429, "Token limit exceeded", Date.now() - startTime)
      return NextResponse.json({ error: "Token limit exceeded" }, { status: 429 })
    }

    // Get agent if specified
    let agent = null
    let agentMemories: any[] = []
    if (agent_id) {
      const { data: agentData } = await supabase
        .from("agents")
        .select("*")
        .eq("id", agent_id)
        .eq("user_id", userProfile.id)
        .eq("is_active", true)
        .single()

      agent = agentData

      if (agent?.has_memory) {
        const { data: memories } = await supabase
          .from("agent_memory")
          .select("*")
          .eq("agent_id", agent_id)
          .eq("user_id", userProfile.id)
          .order("importance_score", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(10)

        agentMemories = memories || []
      }
    }

    // Prepare messages with agent context and memory
    let processedMessages = [{ role: "user", content: message }]

    if (agent) {
      const systemMessage = {
        role: "system",
        content: agent.system_prompt || "You are a helpful AI assistant.",
      }

      // Add memory context if available
      if (agentMemories.length > 0) {
        const memoryContext = agentMemories.map((memory) => `${memory.memory_key}: ${memory.memory_value}`).join("\n")
        systemMessage.content += `\n\nحافظه قبلی:\n${memoryContext}\n`
      }

      processedMessages = [systemMessage, ...processedMessages]
    }

    // Initialize APIClient with LLM7_API_KEY
    const llm7ApiKey = process.env.LLM7_API_KEY
    if (!llm7ApiKey) {
      console.error("LLM7_API_KEY is not set in environment variables.")
      await logRequest(
        supabase,
        userProfile.id,
        request,
        body,
        500,
        "LLM7_API_KEY not configured",
        Date.now() - startTime,
      )
      return NextResponse.json({ error: "Server configuration error: LLM API key missing." }, { status: 500 })
    }
    const llm7ApiClient = new APIClient(API_BASE_URL, llm7ApiKey)

    // Make request to LLM7.io API using APIClient
    const response = await llm7ApiClient.createChatCompletion({
      model,
      messages: processedMessages,
      temperature,
      max_tokens,
      stream,
    })

    const processingTime = Date.now() - startTime

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`LLM API error: ${response.status} - ${errorText}`)

      // Log the failed request
      await logRequest(supabase, userProfile.id, request, body, response.status, errorText, processingTime)

      // Return a mock response for testing
      const mockResponse = {
        id: "chatcmpl-test",
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: model,
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: `سلام! من یک دستیار هوش مصنوعی هستم. متأسفانه در حال حاضر اتصال به سرویس اصلی مشکل دارد، اما من اینجا هستم تا به شما کمک کنم. (مدل: ${model})`,
            },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 50,
          total_tokens: 60,
        },
      }

      // Log successful mock response
      await logRequest(supabase, userProfile.id, request, body, 200, null, processingTime, mockResponse)

      // Update user token usage
      await supabase.rpc("increment_user_tokens", {
        user_id: userProfile.id,
        tokens: mockResponse.usage.total_tokens,
      })

      return NextResponse.json(mockResponse)
    }

    // Handle successful response
    if (stream) {
      // Log streaming request
      await logRequest(supabase, userProfile.id, request, body, 200, null, processingTime)

      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } else {
      const data: LLM7Response = await response.json()

      // Log successful request
      await logRequest(supabase, userProfile.id, request, body, 200, null, processingTime, data)

      // Update user token usage
      const tokensUsed = data.usage?.total_tokens || max_tokens
      await supabase.rpc("increment_user_tokens", {
        user_id: userProfile.id,
        tokens: tokensUsed,
      })

      // Store conversation and message if not streaming
      if (agent_id) {
        await storeConversation(supabase, userProfile.id, agent_id, model, processedMessages, data.choices[0].message)
      }

      return NextResponse.json({
        response: data.choices[0].message.content,
        model: data.model,
        tokens_used: tokensUsed,
        remaining_tokens: userProfile.tokens_limit - (userProfile.tokens_used + tokensUsed),
        success: true,
      })
    }
  } catch (error) {
    console.error("Chat completion error:", error)

    const processingTime = Date.now() - startTime
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    })

    await logRequest(
      supabase,
      null,
      request,
      null,
      500,
      error instanceof Error ? error.message : "Unknown error",
      processingTime,
    )

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Persian LLM Chat API",
    version: "1.0.0",
    endpoints: {
      chat: "POST /api/llm/chat",
      models: "GET /api/llm/models",
    },
    authentication: "Bearer token required",
  })
}

// Helper function to log requests
async function logRequest(
  supabase: any,
  userId: string | null,
  request: NextRequest,
  requestBody: any,
  status: number,
  errorMessage: string | null,
  processingTime: number,
  responseBody?: any,
) {
  const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  try {
    await supabase.from("request_logs").insert({
      user_id: userId,
      ip_address: clientIP,
      user_agent: request.headers.get("user-agent"),
      endpoint: "/api/llm/chat", // Updated endpoint name
      method: "POST",
      request_body: requestBody,
      response_body: responseBody,
      response_status: status,
      model_id: requestBody?.model,
      tokens_used: responseBody?.usage?.total_tokens || requestBody?.max_tokens || 0,
      processing_time_ms: processingTime,
      error_message: errorMessage,
    })
  } catch (logError) {
    console.error("Failed to log request:", logError)
  }
}

// Helper function to store conversation
async function storeConversation(
  supabase: any,
  userId: string,
  agentId: string,
  model: string,
  messages: any[],
  assistantMessage: any,
) {
  try {
    // Create or get conversation
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        agent_id: agentId,
        model_id: model,
        title: messages[0]?.content?.slice(0, 50) + (messages[0]?.content?.length > 50 ? "..." : ""),
      })
      .select()
      .single()

    if (convError) {
      console.error("Error creating conversation:", convError)
      return
    }

    // Store messages
    const messagesToStore = [
      ...messages.map((msg) => ({
        conversation_id: conversation.id,
        role: msg.role,
        content: msg.content,
        model_id: model,
      })),
      {
        conversation_id: conversation.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        model_id: model,
      },
    ]

    await supabase.from("messages").insert(messagesToStore)
  } catch (error) {
    console.error("Error storing conversation:", error)
  }
}
