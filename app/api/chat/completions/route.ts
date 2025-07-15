import { type NextRequest, NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/types"

const API_BASE_URL = "https://api.llm7.io/v1"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { messages, model, temperature = 0.7, max_tokens = 2000, stream = false, agent_id } = body

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
    let processedMessages = [...messages]

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

      processedMessages = [systemMessage, ...messages]
    }

    // Make request to LLM7.io API
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Persian-LLM-SaaS/1.0",
      },
      body: JSON.stringify({
        model,
        messages: processedMessages,
        temperature,
        max_tokens,
        stream,
      }),
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
      const data = await response.json()

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
        await storeConversation(supabase, userProfile.id, agent_id, model, messages, data.choices[0].message)
      }

      return NextResponse.json(data)
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
      endpoint: "/api/chat/completions",
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
