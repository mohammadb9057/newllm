import { createClient } from '@supabase/supabase-js'

export interface PersianLLMProvider {
  name: string
  endpoint: string
  apiKey?: string
  model: string
  maxTokens: number
  temperature: number
}

export const PERSIAN_LLM_PROVIDERS: PersianLLMProvider[] = [
  {
    name: 'OpenAI GPT-4 (Persian)',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4',
    maxTokens: 4096,
    temperature: 0.7
  },
  {
    name: 'PersianMind',
    endpoint: 'https://api.huggingface.co/models/universitytehran/PersianMind-v1.0',
    model: 'universitytehran/PersianMind-v1.0',
    maxTokens: 2048,
    temperature: 0.7
  },
  {
    name: 'Maral-7B',
    endpoint: 'https://api.huggingface.co/models/MaralGPT/Maral-7B-alpha-1',
    model: 'MaralGPT/Maral-7B-alpha-1',
    maxTokens: 2048,
    temperature: 0.7
  }
]

export class PersianLLMClient {
  private provider: PersianLLMProvider
  private apiKey: string

  constructor(provider: PersianLLMProvider, apiKey: string) {
    this.provider = provider
    this.apiKey = apiKey
  }

  async generateText(prompt: string, options?: {
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
  }): Promise<string> {
    const maxTokens = options?.maxTokens || this.provider.maxTokens
    const temperature = options?.temperature || this.provider.temperature
    const systemPrompt = options?.systemPrompt || 'شما یک دستیار هوش مصنوعی فارسی‌زبان هستید که به کاربران کمک می‌کنید.'

    try {
      if (this.provider.name.includes('OpenAI')) {
        return await this.callOpenAI(prompt, systemPrompt, maxTokens, temperature)
      } else {
        return await this.callHuggingFace(prompt, maxTokens, temperature)
      }
    } catch (error) {
      console.error('Error generating text:', error)
      throw new Error('خطا در تولید متن. لطفاً دوباره تلاش کنید.')
    }
  }

  private async callOpenAI(prompt: string, systemPrompt: string, maxTokens: number, temperature: number): Promise<string> {
    const response = await fetch(this.provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.provider.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private async callHuggingFace(prompt: string, maxTokens: number, temperature: number): Promise<string> {
    const response = await fetch(this.provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: temperature,
          return_full_text: false
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data[0].generated_text || data.generated_text || 'خطا در دریافت پاسخ'
  }

  async summarizeText(text: string): Promise<string> {
    const prompt = `لطفاً متن زیر را خلاصه کنید:

${text}

خلاصه:`

    return await this.generateText(prompt, {
      systemPrompt: 'شما یک دستیار خلاصه‌سازی متن فارسی هستید. خلاصه‌های مفید و مختصر ارائه دهید.',
      maxTokens: 512
    })
  }

  async translateText(text: string, targetLanguage: 'en' | 'fa'): Promise<string> {
    const languageMap = {
      'en': 'انگلیسی',
      'fa': 'فارسی'
    }

    const prompt = `لطفاً متن زیر را به ${languageMap[targetLanguage]} ترجمه کنید:

${text}

ترجمه:`

    return await this.generateText(prompt, {
      systemPrompt: 'شما یک مترجم حرفه‌ای هستید که متون را بین فارسی و انگلیسی ترجمه می‌کنید.',
      maxTokens: Math.min(text.length * 2, 2048)
    })
  }

  async analyzeText(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral'
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

    const analysis = await this.generateText(prompt, {
      systemPrompt: 'شما یک تحلیلگر متن فارسی هستید که احساسات، کلمات کلیدی و خلاصه متون را استخراج می‌کنید.',
      maxTokens: 1024
    })

    // Parse the analysis (this is a simplified version)
    const lines = analysis.split('\n').filter(line => line.trim())
    
    return {
      sentiment: this.extractSentiment(analysis),
      keywords: this.extractKeywords(analysis),
      summary: lines[lines.length - 1] || 'خلاصه‌ای در دسترس نیست'
    }
  }

  private extractSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    if (text.includes('مثبت') || text.includes('positive')) return 'positive'
    if (text.includes('منفی') || text.includes('negative')) return 'negative'
    return 'neutral'
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - in a real implementation, this would be more sophisticated
    const words = text.split(/\s+/)
    const keywords = words.filter(word => 
      word.length > 3 && 
      !['این', 'آن', 'که', 'در', 'از', 'به', 'با', 'برای', 'تا'].includes(word)
    )
    return keywords.slice(0, 5) // Return top 5 keywords
  }
}

export function createPersianLLMClient(providerName: string, apiKey: string): PersianLLMClient {
  const provider = PERSIAN_LLM_PROVIDERS.find(p => p.name === providerName)
  if (!provider) {
    throw new Error(`Provider ${providerName} not found`)
  }
  return new PersianLLMClient(provider, apiKey)
}

