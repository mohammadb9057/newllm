"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Bot, Save, ArrowLeft, Brain, Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast" // Corrected import path
import { DashboardHeader } from "@/components/dashboard-header"
import Link from "next/link"

interface Model {
  id: string
  name: string // Added name for display
  description: string
  max_tokens: number
  cost_per_token: number
  owned_by?: string // Added owned_by for display
}

export default function NewAgentPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  const [loading, setLoading] = useState(false)
  const [models, setModels] = useState<Model[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    system_prompt: "",
    model_id: "", // Initialize as empty string
    memory_type: "conversation",
    has_memory: true,
  })

  useEffect(() => {
    if (user) {
      // Only load models if user is authenticated
      loadModels()
    }
  }, [user]) // Depend on user to ensure auth is ready

  const loadModels = async () => {
    try {
      // Fetch models from our internal API route, which now proxies to LLM7.io
      const response = await fetch("/api/llm/models", {
        headers: {
          Authorization: `Bearer ${user?.api_token}`, // Pass user's API token for authentication with our backend
        },
      })
      const data = await response.json()

      if (response.ok && data.models) {
        setModels(data.models || [])
        if (data.models?.length > 0) {
          setFormData((prev) => ({ ...prev, model_id: data.models[0].id }))
        }
      } else {
        console.error("Error loading models:", data.error || "Unknown error")
        toast({
          title: "خطا",
          description: data.error || "خطا در بارگذاری مدل‌ها",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading models:", error)
      toast({
        title: "خطا",
        description: "خطا در بارگذاری مدل‌ها",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("agents")
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description,
          system_prompt: formData.system_prompt,
          model_id: formData.model_id,
          memory_type: formData.memory_type,
          has_memory: formData.has_memory,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "ایجنت ساخته شد",
        description: `ایجنت "${formData.name}" با موفقیت ساخته شد`,
      })

      router.push("/agents")
    } catch (error) {
      console.error("Error creating agent:", error)
      toast({
        title: "خطا",
        description: "خطا در ساخت ایجنت",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!user) {
    return <div>در حال بارگذاری...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/agents">
              <Button variant="outline" size="sm">
                <ArrowLeft className="ml-2 h-4 w-4" />
                بازگشت
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ساخت ایجنت جدید</h1>
              <p className="text-gray-600 dark:text-gray-400">ایجنت هوش مصنوعی شخصی خود را بسازید</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                اطلاعات پایه
              </CardTitle>
              <CardDescription>نام و توضیحات ایجنت خود را وارد کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام ایجنت *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="مثال: دستیار برنامه‌نویسی"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">مدل هوش مصنوعی</Label>
                  <Select value={formData.model_id} onValueChange={(value) => handleInputChange("model_id", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب مدل" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <span>{model.name || model.id}</span> {/* Use model.name if available */}
                            {model.owned_by && (
                              <Badge variant="outline" className="text-xs">
                                {model.owned_by}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="توضیح کوتاهی از کاربرد و ویژگی‌های ایجنت"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                دستورالعمل سیستم
              </CardTitle>
              <CardDescription>شخصیت و رفتار ایجنت را تعریف کنید</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="system_prompt">دستورالعمل سیستم</Label>
                <Textarea
                  id="system_prompt"
                  value={formData.system_prompt}
                  onChange={(e) => handleInputChange("system_prompt", e.target.value)}
                  placeholder="شما یک دستیار هوش مصنوعی هستید که در زمینه برنامه‌نویسی تخصص دارید. همیشه پاسخ‌های دقیق و کاربردی ارائه دهید و از زبان فارسی استفاده کنید."
                  rows={6}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  این متن نحوه رفتار و پاسخ‌دهی ایجنت را تعیین می‌کند. هرچه دقیق‌تر باشد، ایجنت بهتر عمل خواهد کرد.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Memory Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                تنظیمات حافظه
              </CardTitle>
              <CardDescription>نحوه ذخیره و استفاده از حافظه ایجنت را تنظیم کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>فعال‌سازی حافظه</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ایجنت اطلاعات مهم را به خاطر خواهد سپرد</p>
                </div>
                <Switch
                  checked={formData.has_memory}
                  onCheckedChange={(checked) => handleInputChange("has_memory", checked)}
                />
              </div>

              {formData.has_memory && (
                <div className="space-y-2">
                  <Label>نوع حافظه</Label>
                  <Select
                    value={formData.memory_type}
                    onValueChange={(value) => handleInputChange("memory_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversation">حافظه مکالمه</SelectItem>
                      <SelectItem value="vector">حافظه برداری</SelectItem>
                      <SelectItem value="hybrid">حافظه ترکیبی</SelectItem>
                      <SelectItem value="none">بدون حافظه</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.memory_type === "conversation" && "ذخیره تاریخچه مکالمات"}
                    {formData.memory_type === "vector" && "جستجوی هوشمند در اطلاعات"}
                    {formData.memory_type === "hybrid" && "ترکیب هر دو نوع حافظه"}
                    {formData.memory_type === "none" && "بدون ذخیره حافظه"}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.name && (
            <Card>
              <CardHeader>
                <CardTitle>پیش‌نمایش ایجنت</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <Bot className="h-8 w-8 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="font-medium">{formData.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formData.description || "بدون توضیحات"}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{formData.model_id}</Badge>
                      {formData.has_memory && (
                        <Badge variant="secondary" className="text-xs">
                          <Brain className="ml-1 h-3 w-3" />
                          {formData.memory_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/agents">
              <Button variant="outline" type="button">
                انصراف
              </Button>
            </Link>
            <Button type="submit" disabled={loading || !formData.name || !formData.model_id}>
              {" "}
              {/* Disable if model_id is not selected */}
              {loading ? (
                "در حال ساخت..."
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  ساخت ایجنت
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
