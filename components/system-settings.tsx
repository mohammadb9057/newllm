"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Save, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SystemConfig {
  site_name: string
  site_description: string
  default_token_limit: number
  api_proxy_url: string
  allowed_models: string[]
}

export function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    site_name: "پلتفرم هوش مصنوعی",
    site_description: "پلتفرم پیشرفته هوش مصنوعی با قابلیت ساخت ایجنت شخصی",
    default_token_limit: 1000,
    api_proxy_url: "https://api.llm7.io/v1",
    allowed_models: [],
  })
  const [loading, setLoading] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const { toast } = useToast()

  const loadModelsFromAPI = async () => {
    setLoadingModels(true)
    try {
      const response = await fetch("/api/models")
      const data = await response.json()

      if (data.data && Array.isArray(data.data)) {
        const modelIds = data.data.map((model: any) => model.id)
        setConfig((prev) => ({ ...prev, allowed_models: modelIds }))
        toast({
          title: "مدل‌ها بارگذاری شد",
          description: `${modelIds.length} مدل از API بارگذاری شد`,
        })
      }
    } catch (error) {
      console.error("Error loading models:", error)
      toast({
        title: "خطا",
        description: "خطا در بارگذاری مدل‌ها از API",
        variant: "destructive",
      })
    } finally {
      setLoadingModels(false)
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      // In a real implementation, you'd save to database
      toast({
        title: "تنظیمات ذخیره شد",
        description: "تنظیمات سیستم با موفقیت ذخیره شد",
      })
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ذخیره تنظیمات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          تنظیمات سیستم
        </CardTitle>
        <CardDescription>تنظیمات کلی سیستم و API</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">نام سایت</Label>
            <Input
              id="site-name"
              value={config.site_name}
              onChange={(e) => setConfig((prev) => ({ ...prev, site_name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token-limit">حد پیش‌فرض توکن</Label>
            <Input
              id="token-limit"
              type="number"
              value={config.default_token_limit}
              onChange={(e) => setConfig((prev) => ({ ...prev, default_token_limit: Number.parseInt(e.target.value) }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="site-description">توضیحات سایت</Label>
          <Textarea
            id="site-description"
            value={config.site_description}
            onChange={(e) => setConfig((prev) => ({ ...prev, site_description: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="api-url">آدرس API پراکسی</Label>
          <Input
            id="api-url"
            value={config.api_proxy_url}
            onChange={(e) => setConfig((prev) => ({ ...prev, api_proxy_url: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>مدل‌های مجاز</Label>
            <Button variant="outline" size="sm" onClick={loadModelsFromAPI} disabled={loadingModels}>
              {loadingModels ? (
                <RefreshCw className="h-4 w-4 animate-spin ml-2" />
              ) : (
                <RefreshCw className="h-4 w-4 ml-2" />
              )}
              بارگذاری از API
            </Button>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            {config.allowed_models.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {config.allowed_models.map((model, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                  >
                    {model}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">هیچ مدلی بارگذاری نشده</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={saveSettings} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
            ذخیره تنظیمات
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
