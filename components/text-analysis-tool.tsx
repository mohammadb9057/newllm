"use client"

import { useState, useEffect } from "react" // Import useEffect
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { FileText, Languages, BarChart3, Copy, Download } from "lucide-react"
import { createPersianLLMClient } from "@/lib/persian-llm-client" // Updated import
import { useToast } from "@/hooks/use-toast" // Use shadcn toast

interface AnalysisResult {
  sentiment: "positive" | "negative" | "neutral"
  keywords: string[]
  summary: string
}

interface Model {
  id: string
  name: string
  description: string
  max_tokens: number
  cost_per_token: number
}

export function TextAnalysisTool() {
  const { toast } = useToast() // Initialize useToast
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("analyze")
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined) // Changed to string | undefined
  const [apiKey, setApiKey] = useState("") // This is the user's LLM7.io API key for this tool
  const [availableModels, setAvailableModels] = useState<Model[]>([]) // State for fetched models

  // Results
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [summaryResult, setSummaryResult] = useState("")
  const [translationResult, setTranslationResult] = useState("")
  const [targetLanguage, setTargetLanguage] = useState<"en" | "fa">("en")

  useEffect(() => {
    // Fetch models when component mounts
    const fetchModels = async () => {
      try {
        // This API call is to our backend, which then proxies to LLM7.io
        const response = await fetch("/api/llm/models", {
          headers: {
            // Assuming a dummy token or no token is needed for this public endpoint
            // If authentication is required, you'd need to pass the user's main API token here
            // For this tool, the user provides their own LLM7.io API key directly.
            // So, this fetch is just to get the list of available models from our proxy.
            // If not, you might need to adjust the backend /api/llm/models to not require auth for model list.
            Authorization: `Bearer dummy_token_for_model_list`, // Replace with actual user token if needed
          },
        })
        if (response.ok) {
          const data = await response.json()
          setAvailableModels(data.models)
          if (data.models.length > 0) {
            setSelectedModel(data.models[0].id) // Set default selected model
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
    fetchModels()
  }, [])

  const handleAnalyze = async () => {
    if (!inputText.trim() || !apiKey || !selectedModel) {
      toast({
        title: "خطا",
        description: "لطفاً متن، کلید API و مدل را وارد کنید",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const client = createPersianLLMClient(apiKey) // Pass LLM7.io API key
      const result = await client.analyzeText(inputText, selectedModel)
      setAnalysisResult(result)
      toast({
        title: "موفقیت",
        description: "تحلیل متن با موفقیت انجام شد",
      })
    } catch (error: any) {
      console.error("Error analyzing text:", error)
      toast({
        title: "خطا",
        description: error.message || "خطا در تحلیل متن",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSummarize = async () => {
    if (!inputText.trim() || !apiKey || !selectedModel) {
      toast({
        title: "خطا",
        description: "لطفاً متن، کلید API و مدل را وارد کنید",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const client = createPersianLLMClient(apiKey)
      const result = await client.summarizeText(inputText, selectedModel)
      setSummaryResult(result)
      toast({
        title: "موفقیت",
        description: "خلاصه‌سازی با موفقیت انجام شد",
      })
    } catch (error: any) {
      console.error("Error summarizing text:", error)
      toast({
        title: "خطا",
        description: error.message || "خطا در خلاصه‌سازی متن",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTranslate = async () => {
    if (!inputText.trim() || !apiKey || !selectedModel) {
      toast({
        title: "خطا",
        description: "لطفاً متن، کلید API و مدل را وارد کنید",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const client = createPersianLLMClient(apiKey)
      const result = await client.translateText(inputText, selectedModel, targetLanguage)
      setTranslationResult(result)
      toast({
        title: "موفقیت",
        description: "ترجمه با موفقیت انجام شد",
      })
    } catch (error: any) {
      console.error("Error translating text:", error)
      toast({
        title: "خطا",
        description: error.message || "خطا در ترجمه متن",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "کپی شد",
      description: "متن با موفقیت کپی شد",
    })
  }

  const downloadResult = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "دانلود شد",
      description: "فایل با موفقیت دانلود شد",
    })
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200"
      case "negative":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSentimentText = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "مثبت"
      case "negative":
        return "منفی"
      default:
        return "خنثی"
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>تنظیمات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">مدل هوش مصنوعی</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب مدل" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">کلید API (LLM7.io)</label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="کلید API خود را از llm7.io وارد کنید"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Text */}
      <Card>
        <CardHeader>
          <CardTitle>متن ورودی</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="متن خود را اینجا وارد کنید..."
            rows={8}
            className="w-full"
          />
          <div className="text-sm text-muted-foreground mt-2">تعداد کاراکتر: {inputText.length}</div>
        </CardContent>
      </Card>

      {/* Analysis Tools */}
      <Card>
        <CardHeader>
          <CardTitle>ابزارهای تحلیل متن</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analyze" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                تحلیل احساسات
              </TabsTrigger>
              <TabsTrigger value="summarize" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                خلاصه‌سازی
              </TabsTrigger>
              <TabsTrigger value="translate" className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                ترجمه
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="space-y-4">
              <Button
                onClick={handleAnalyze}
                disabled={isLoading || !inputText.trim() || !apiKey || !selectedModel}
                className="w-full"
              >
                {isLoading ? "در حال تحلیل..." : "تحلیل متن"}
              </Button>

              {analysisResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">نتایج تحلیل</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">احساس کلی:</h4>
                      <Badge className={getSentimentColor(analysisResult.sentiment)}>
                        {getSentimentText(analysisResult.sentiment)}
                      </Badge>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">کلمات کلیدی:</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">خلاصه:</h4>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(analysisResult.summary)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadResult(analysisResult.summary, "analysis-summary.txt")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="bg-muted p-3 rounded-md">{analysisResult.summary}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="summarize" className="space-y-4">
              <Button
                onClick={handleSummarize}
                disabled={isLoading || !inputText.trim() || !apiKey || !selectedModel}
                className="w-full"
              >
                {isLoading ? "در حال خلاصه‌سازی..." : "خلاصه‌سازی متن"}
              </Button>

              {summaryResult && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">خلاصه متن</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(summaryResult)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadResult(summaryResult, "summary.txt")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">{summaryResult}</div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="translate" className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">زبان مقصد</label>
                  <Select value={targetLanguage} onValueChange={(value: "en" | "fa") => setTargetLanguage(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">انگلیسی</SelectItem>
                      <SelectItem value="fa">فارسی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleTranslate}
                  disabled={isLoading || !inputText.trim() || !apiKey || !selectedModel}
                  className="flex-1"
                >
                  {isLoading ? "در حال ترجمه..." : "ترجمه متن"}
                </Button>
              </div>

              {translationResult && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">ترجمه</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(translationResult)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadResult(translationResult, "translation.txt")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">{translationResult}</div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
