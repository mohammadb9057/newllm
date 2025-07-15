import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = "https://api.llm7.io/v1"

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/models`, {
      headers: {
        "User-Agent": "Persian-LLM-SaaS/1.0",
      },
      cache: "no-store", // Always fetch fresh data
    })

    if (!response.ok) {
      console.error(`API responded with status: ${response.status}`)
      // Return a fallback list of common models
      return NextResponse.json({
        object: "list",
        data: [
          {
            id: "gpt-3.5-turbo",
            object: "model",
            created: Date.now(),
            owned_by: "openai",
          },
          {
            id: "gpt-4",
            object: "model",
            created: Date.now(),
            owned_by: "openai",
          },
          {
            id: "claude-3-sonnet",
            object: "model",
            created: Date.now(),
            owned_by: "anthropic",
          },
        ],
      })
    }

    const data = await response.json()

    // Ensure we return the expected format
    return NextResponse.json({
      object: "list",
      data: data.data || data || [],
    })
  } catch (error) {
    console.error("Error fetching models:", error)

    // Return fallback models on error
    return NextResponse.json({
      object: "list",
      data: [
        {
          id: "gpt-3.5-turbo",
          object: "model",
          created: Date.now(),
          owned_by: "openai",
        },
        {
          id: "gpt-4",
          object: "model",
          created: Date.now(),
          owned_by: "openai",
        },
      ],
    })
  }
}
