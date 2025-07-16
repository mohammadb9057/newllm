"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Send, Bot, User, Zap } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast" // Corrected import path

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  model?: string
  tokens_used?: number
}

interface Model {
  id: string
  name: string
  description: string
  max_tokens: number
  cost_per_token: number
}

export function PersianLLMChat() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined) // Initialize as undefined
  const [models, setModels] = useState<Model[]>([])
  const [userTokens, setUserTokens] = useState({ used: 0, limit: 1000, remaining: 1000 })

  useEffect(() => {
    if (user?.api_token) {
      fetchModels()
      fetchUsage()
    }
  }, [user])

  const fetchModels = async () => {
    if (!user?.api_token) return

    try {
      // Fetch models from our internal API route, which now proxies to LLM7.io
      const response = await fetch("/api/llm/models", {
        headers: {
          Authorization: `Bearer ${user.api_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setModels(data.models)
        if (data.models.length > 0 && !selectedModel) {
          // Set default if not already set
          setSelectedModel(data.models[0].id)
        }
        if (data.user_info) {
          setUserTokens({
            used: data.user_info.tokens_used,
            limit: data.user_info.tokens_limit,
            remaining: data.user_info.remaining_tokens,
          })
        }
      } else {
        console.error("Failed to fetch models:", await response.text())
        toast({
          title: "خطا",
          description: "خطا در بارگذاری مدل‌ها",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching models:", error)
      toast({
        title: "خطا",
        description: "خطا در بارگذاری مدل‌ها",
        variant: "destructive",
      })
    }
  }

  const fetchUsage = async () => {
    if (!user?.api_token) return

    try {
      const response = await fetch("/api/llm/usage", {
        headers: {
          Authorization: `Bearer ${user.api_token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.usage) {
          setUserTokens({
            used: data.usage.tokens_used,
            limit: data.usage.tokens_limit,
            remaining: data.usage.remaining_tokens,
          })
        }
      } else {
        console.error("Failed to fetch usage:", await response.text())
        toast({
          title: "خطا",
          description: "خطا در بارگذاری آمار مصرف",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching usage:", error)
      toast({
        title: "خطا",
        description: "خطا در بارگذاری آمار مصرف",
        variant: "destructive",
      })
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !user?.api_token || !selectedModel) return // Ensure model is selected

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/llm/chat", {
        // This route already proxies to LLM7.io
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.api_token}`,
        },
        body: JSON.stringify({
          message: input,
          model: selectedModel,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: "assistant",
          timestamp: new Date(),
          model: data.model,
          tokens_used: data.tokens_used,
        }

        setMessages((prev) => [...prev, assistantMessage])

        // Update token usage
        setUserTokens((prev) => ({
          ...prev,
          used: prev.used + data.tokens_used,
          remaining: data.remaining_tokens,
        }))

        toast({
          title: "پاسخ دریافت شد",
          description: `${data.tokens_used} توکن استفاده شد`,
        })
      } else {
        toast({
          title: "خطا",
          description: data.error || "خطا در ارسال پیام",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "خطا",
        description: "خطا در ارتباط با سرور",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">برای استفاده از چت، لطفاً وارد شوید.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Token Usage Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              میزان استفاده توکن
            </span>
            <Badge variant={userTokens.remaining < 100 ? "destructive" : "secondary"}>
              {userTokens.remaining.toLocaleString("fa-IR")} باقی‌مانده
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>استفاده شده: {userTokens.used.toLocaleString("fa-IR")}</span>
              <span>حد مجاز: {userTokens.limit.toLocaleString("fa-IR")}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((userTokens.used / userTokens.limit) * 100, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            چت هوشمند
          </CardTitle>
          <div className="flex gap-4">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="انتخاب مدل" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline">
              {models.find((m) => m.id === selectedModel)?.name || selectedModel || "مدل نامشخص"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 mb-4 p-4 border rounded-lg">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>سلام! چطور می‌تونم کمکتون کنم؟</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        <span className="text-xs opacity-70">{message.timestamp.toLocaleTimeString("fa-IR")}</span>
                        {message.tokens_used && (
                          <Badge variant="secondary" className="text-xs">
                            {message.tokens_used} توکن
                          </Badge>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span className="text-sm">در حال تایپ...</span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="پیام خود را بنویسید..."
              disabled={isLoading || userTokens.remaining <= 0 || !selectedModel} // Disable if no model selected
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim() || userTokens.remaining <= 0 || !selectedModel} // Disable if no model selected
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {userTokens.remaining <= 0 && (
            <p className="text-sm text-red-600 mt-2 text-center">
              حد مجاز توکن شما تمام شده است. برای ادامه استفاده، لطفاً با پشتیبانی تماس بگیرید.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
