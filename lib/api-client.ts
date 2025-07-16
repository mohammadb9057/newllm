const API_BASE_URL = "https://api.llm7.io/v1"

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface Model {
  id: string
  object: string
  created: number
  owned_by: string
  permission?: any[]
  root?: string
  parent?: string
}

export class APIClient {
  private baseUrl: string
  private llm7ApiKey?: string // Changed from apiKey to llm7ApiKey for clarity

  constructor(baseUrl: string = API_BASE_URL, llm7ApiKey?: string) {
    this.baseUrl = baseUrl
    this.llm7ApiKey = llm7ApiKey
  }

  async getModels(): Promise<Model[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`HTTP error fetching models! status: ${response.status}, response: ${errorText}`)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error("Error fetching models:", error)
      return []
    }
  }

  async createChatCompletion(request: ChatCompletionRequest): Promise<Response> {
    return fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {}

    if (this.llm7ApiKey) {
      // Use llm7ApiKey
      headers["Authorization"] = `Bearer ${this.llm7ApiKey}`
    }
    // Add a custom User-Agent header for better API tracking
    headers["User-Agent"] = "NewLLM-SaaS-Backend/1.0"

    return headers
  }
}

// Export a default client for general use, without an API key initially
// The API key will be passed when creating instances in server routes
export const apiClient = new APIClient()
