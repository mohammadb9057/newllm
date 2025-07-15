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
  private apiKey?: string

  constructor(baseUrl: string = API_BASE_URL, apiKey?: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  async getModels(): Promise<Model[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.getHeaders(),
      })

      if (!response.ok) {
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

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`
    }

    return headers
  }
}

export const apiClient = new APIClient()
