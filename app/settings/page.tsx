import { requireAuth } from "@/lib/auth"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DashboardHeader } from "@/components/dashboard-header"
import { CopyButton } from "@/components/copy-button"
import { RegenerateTokenButton } from "@/components/regenerate-token-button"
import { Key, User, Shield, Zap, Code, Globe } from "lucide-react"
import type { Database } from "@/lib/supabase/types"

export default async function SettingsPage() {
  const user = await requireAuth()
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })

  // Get or create user profile
  let { data: userProfile } = await supabase.from("users").select("*").eq("id", user.id).single()

  // If profile doesn't exist, create it
  if (!userProfile) {
    const { data: newProfile, error } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.email!.split("@")[0],
        tokens_used: 0,
        tokens_limit: 1000,
        is_admin: false,
        api_token: `llm_${crypto.randomUUID().replace(/-/g, "").substring(0, 32)}`,
      })
      .select()
      .single()

    if (!error) {
      userProfile = newProfile
    }
  }

  // Generate API token if not exists
  if (!userProfile?.api_token) {
    const newToken = `llm_${crypto.randomUUID().replace(/-/g, "").substring(0, 32)}`
    await supabase.from("users").update({ api_token: newToken }).eq("id", user.id)
    if (userProfile) {
      userProfile.api_token = newToken
    }
  }

  const apiToken = userProfile?.api_token || "در حال تولید..."
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">تنظیمات</h1>
          <p className="text-gray-600 dark:text-gray-400">تنظیمات حساب کاربری و API خود را مدیریت کنید</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                اطلاعات حساب کاربری
              </CardTitle>
              <CardDescription>اطلاعات شخصی و حساب کاربری شما</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام کامل</Label>
                  <Input id="name" value={userProfile?.name || ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input id="email" value={userProfile?.email || ""} readOnly />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={userProfile?.is_admin ? "default" : "secondary"}>
                  {userProfile?.is_admin ? "مدیر سیستم" : "کاربر عادی"}
                </Badge>
                <Badge variant="outline">
                  عضو از {new Date(userProfile?.created_at || "").toLocaleDateString("fa-IR")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                تنظیمات API
              </CardTitle>
              <CardDescription>کلید API برای استفاده از سرویس‌های هوش مصنوعی</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="api-token">کلید API شخصی</Label>
                <div className="flex gap-2">
                  <Input id="api-token" value={apiToken} readOnly className="font-mono text-sm" />
                  <CopyButton text={apiToken} />
                  <RegenerateTokenButton userId={user.id} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  این کلید را برای احراز هویت در درخواست‌های API استفاده کنید. هرگز آن را به اشتراک نگذارید.
                </p>
              </div>

              <Separator />

              {/* API Documentation */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  <Label className="text-base font-medium">راهنمای استفاده از API</Label>
                </div>

                {/* Base URL */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    آدرس پایه API
                  </Label>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <code className="text-sm text-blue-600 dark:text-blue-400">{baseUrl}/api</code>
                  </div>
                </div>

                {/* Chat Completions Example */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">مثال درخواست چت (cURL)</Label>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      {`curl -X POST "${baseUrl}/api/chat/completions" \\
  -H "Authorization: Bearer ${apiToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "سلام! چطوری؟"
      }
    ],
    "temperature": 0.7,
    "max_tokens": 1000
  }'`}
                    </pre>
                  </div>
                </div>

                {/* JavaScript Example */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">مثال JavaScript</Label>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      {`const response = await fetch('${baseUrl}/api/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiToken}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: 'سلام! چطوری؟' }
    ],
    temperature: 0.7,
    max_tokens: 1000
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`}
                    </pre>
                  </div>
                </div>

                {/* Python Example */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">مثال Python</Label>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      {`import requests

url = "${baseUrl}/api/chat/completions"
headers = {
    "Authorization": "Bearer ${apiToken}",
    "Content-Type": "application/json"
}
data = {
    "model": "gpt-3.5-turbo",
    "messages": [
        {"role": "user", "content": "سلام! چطوری؟"}
    ],
    "temperature": 0.7,
    "max_tokens": 1000
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result["choices"][0]["message"]["content"])`}
                    </pre>
                  </div>
                </div>

                {/* Available Endpoints */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Endpoint های موجود</Label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        POST
                      </Badge>
                      <code className="text-sm">/api/chat/completions</code>
                      <span className="text-sm text-gray-600 dark:text-gray-400">- چت با مدل‌های AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        GET
                      </Badge>
                      <code className="text-sm">/api/models</code>
                      <span className="text-sm text-gray-600 dark:text-gray-400">- لیست مدل‌های موجود</span>
                    </div>
                  </div>
                </div>

                {/* Response Format */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">فرمت پاسخ</Label>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      {`{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-3.5-turbo",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "سلام! من خوبم، ممنون که پرسیدی. شما چطورید؟"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                آمار استفاده
              </CardTitle>
              <CardDescription>میزان استفاده از توکن‌ها و محدودیت‌ها</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{userProfile?.tokens_used || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">توکن استفاده شده</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{userProfile?.tokens_limit || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">حد مجاز توکن</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.max(0, (userProfile?.tokens_limit || 0) - (userProfile?.tokens_used || 0))}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">توکن باقی‌مانده</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>درصد استفاده</span>
                  <span>
                    {userProfile?.tokens_limit
                      ? Math.round(((userProfile?.tokens_used || 0) / userProfile.tokens_limit) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        userProfile?.tokens_limit
                          ? Math.min(100, ((userProfile?.tokens_used || 0) / userProfile.tokens_limit) * 100)
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Panel Link */}
          {userProfile?.is_admin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  مدیریت سیستم
                </CardTitle>
                <CardDescription>دسترسی به پنل مدیریت سیستم</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <a href="/admin">
                    <Shield className="ml-2 h-4 w-4" />
                    ورود به پنل مدیریت
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
