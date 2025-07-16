import { APIClient, type ChatMessage } from "./api-client" // Import APIClient and ChatMessage

// Removed PERSIAN_LLM_PROVIDERS as models will be fetched dynamically from LLM7.io

export class PersianLLMClient {
  private apiClient: APIClient

  constructor(llm7ApiKey: string) {
    // Initialize APIClient with the provided LLM7.io API key
    this.apiClient = new APIClient("https://api.llm7.io/v1", llm7ApiKey)
  }

  async generateText(
    prompt: string,
    modelId: string,
    options?: {
      maxTokens?: number
      temperature?: number
      systemPrompt?: string
    },
  ): Promise<string> {
    const maxTokens = options?.maxTokens || 2048 // Default max tokens
    const temperature = options?.temperature || 0.7 // Default temperature
    const systemPrompt = options?.systemPrompt || "شما یک دستیار هوش مصنوعی فارسی‌زبان هستید که به کاربران کمک می‌کنید."

    try {
      const messages: ChatMessage[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ]

      const response = await this.apiClient.createChatCompletion({
        model: modelId,
        messages: messages,
        max_tokens: maxTokens,
        temperature: temperature,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`LLM7.io API error: ${response.statusText} - ${errorData.error || "Unknown error"}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error("Error generating text:", error)
      throw new Error("خطا در تولید متن. لطفاً دوباره تلاش کنید.")
    }
  }

  async summarizeText(text: string, modelId: string): Promise<string> {
    const prompt = `لطفاً متن زیر را خلاصه کنید:

${text}

خلاصه:`

    return await this.generateText(prompt, modelId, {
      systemPrompt: "شما یک دستیار خلاصه‌سازی متن فارسی هستید. خلاصه‌های مفید و مختصر ارائه دهید.",
      maxTokens: 512,
    })
  }

  async translateText(text: string, modelId: string, targetLanguage: "en" | "fa"): Promise<string> {
    const languageMap = {
      en: "انگلیسی",
      fa: "فارسی",
    }

    const prompt = `لطفاً متن زیر را به ${languageMap[targetLanguage]} ترجمه کنید:

${text}

ترجمه:`

    return await this.generateText(prompt, modelId, {
      systemPrompt: "شما یک مترجم حرفه‌ای هستید که متون را بین فارسی و انگلیسی ترجمه می‌کنید.",
      maxTokens: Math.min(text.length * 2, 2048),
    })
  }

  async analyzeText(
    text: string,
    modelId: string,
  ): Promise<{
    sentiment: "positive" | "negative" | "neutral"
    keywords: string[]
    summary: string
  }> {
    const prompt = `لطفاً متن زیر را تحلیل کنید و موارد زیر را ارائه دهید:
1. احساس کلی متن (مثبت، منفی، یا خنثی)
2. کلمات کلیدی مهم
3. خلاصه کوتاه

متن:
${text}

تحلیل:`

    const analysis = await this.generateText(prompt, modelId, {
      systemPrompt: "شما یک تحلیلگر متن فارسی هستید که احساسات، کلمات کلیدی و خلاصه متون را استخراج می‌کنید.",
      maxTokens: 1024,
    })

    // Parse the analysis (this is a simplified version)
    const lines = analysis.split("\n").filter((line) => line.trim())

    return {
      sentiment: this.extractSentiment(analysis),
      keywords: this.extractKeywords(analysis),
      summary: lines[lines.length - 1] || "خلاصه‌ای در دسترس نیست",
    }
  }

  private extractSentiment(text: string): "positive" | "negative" | "neutral" {
    if (text.includes("مثبت") || text.includes("positive")) return "positive"
    if (text.includes("منفی") || text.includes("negative")) return "negative"
    return "neutral"
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - in a real implementation, this would be more sophisticated
    const words = text.split(/\s+/)
    const keywords = words.filter(
      (word) => word.length > 3 && !["این", "آن", "که", "در", "از", "به", "با", "برای", "تا"].includes(word),
    )
    return keywords.slice(0, 5) // Return top 5 keywords
  }
}

// This function now creates a PersianLLMClient instance with the provided LLM7.io API key
export function createPersianLLMClient(llm7ApiKey: string): PersianLLMClient {
  return new PersianLLMClient(llm7ApiKey)
}
