'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Send, Bot, User, Copy, Download, Trash2, Settings } from 'lucide-react'
import { PERSIAN_LLM_PROVIDERS, createPersianLLMClient } from '@/lib/persian-llm-client'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  provider?: string
}

interface ChatSettings {
  provider: string
  apiKey: string
  maxTokens: number
  temperature: number
  systemPrompt: string
}

export function PersianLLMChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<ChatSettings>({
    provider: PERSIAN_LLM_PROVIDERS[0].name,
    apiKey: '',
    maxTokens: 1024,
    temperature: 0.7,
    systemPrompt: 'شما یک دستیار هوش مصنوعی فارسی‌زبان هستید که به کاربران کمک می‌کنید.'
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || !settings.apiKey) {
      if (!settings.apiKey) {
        toast.error('لطفاً کلید API را در تنظیمات وارد کنید')
      }
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const client = createPersianLLMClient(settings.provider, settings.apiKey)
      const response = await client.generateText(userMessage.content, {
        maxTokens: settings.maxTokens,
        temperature: settings.temperature,
        systemPrompt: settings.systemPrompt
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        provider: settings.provider
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('خطا در ارسال پیام. لطفاً دوباره تلاش کنید.')
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('پیام کپی شد')
  }

  const clearChat = () => {
    setMessages([])
    toast.success('چت پاک شد')
  }

  const exportChat = () => {
    const chatData = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      provider: msg.provider
    }))
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `persian-llm-chat-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('چت صادر شد')
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">چت با مدل‌های زبانی فارسی</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportChat}
              disabled={messages.length === 0}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {showSettings && (
          <CardContent className="border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">ارائه‌دهنده مدل</label>
                <Select value={settings.provider} onValueChange={(value) => setSettings(prev => ({ ...prev, provider: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERSIAN_LLM_PROVIDERS.map(provider => (
                      <SelectItem key={provider.name} value={provider.name}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">کلید API</label>
                <Input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="کلید API خود را وارد کنید"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">حداکثر توکن‌ها</label>
                <Input
                  type="number"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 1024 }))}
                  min="1"
                  max="4096"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">دما (Temperature)</label>
                <Input
                  type="number"
                  value={settings.temperature}
                  onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0.7 }))}
                  min="0"
                  max="2"
                  step="0.1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">پیام سیستم</label>
                <Textarea
                  value={settings.systemPrompt}
                  onChange={(e) => setSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  placeholder="پیام سیستم برای تنظیم رفتار مدل"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        )}

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>سلام! من دستیار هوش مصنوعی فارسی‌زبان شما هستم.</p>
                <p className="text-sm mt-2">برای شروع، پیامی بنویسید و ارسال کنید.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      
                      <div className={`rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-current/20">
                          <div className="flex items-center gap-2">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString('fa-IR')}
                            </span>
                            {message.provider && (
                              <Badge variant="secondary" className="text-xs">
                                {message.provider}
                              </Badge>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyMessage(message.content)}
                            className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-lg p-3 bg-muted">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          <span className="text-sm">در حال تولید پاسخ...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <Separator />
          
          <div className="p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="پیام خود را بنویسید..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim() || !settings.apiKey}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {!settings.apiKey && (
              <p className="text-sm text-muted-foreground mt-2">
                لطفاً کلید API را در تنظیمات وارد کنید تا بتوانید از چت استفاده کنید.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

