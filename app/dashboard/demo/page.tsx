"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, MessageSquare, Zap, Settings, Plus, Database } from "lucide-react"
import Link from "next/link"

export default function DemoDashboardPage() {
  // Demo data
  const demoUser = {
    id: "demo-user",
    email: "demo@example.com",
    profile: {
      full_name: "کاربر دمو",
      tokens_used: 150,
      tokens_limit: 1000,
      is_admin: false,
    },
  }

  const demoAgents = [
    {
      id: "1",
      name: "دستیار برنامه‌نویسی",
      description: "کمک در کدنویسی و حل مشکلات فنی",
      model_id: "gpt-3.5-turbo",
      has_memory: true,
      is_active: true,
    },
    {
      id: "2",
      name: "مترجم هوشمند",
      description: "ترجمه متون بین زبان‌های مختلف",
      model_id: "gpt-4",
      has_memory: false,
      is_active: true,
    },
  ]

  const demoConversations = [
    { id: "1", title: "سوال درباره React", created_at: "2024-01-15" },
    { id: "2", title: "ترجمه متن انگلیسی", created_at: "2024-01-14" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Demo Header */}
      <header className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">پلتفرم هوش مصنوعی</h1>
          </Link>
          <Badge variant="secondary">حالت دمو</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Demo Alert */}
        <Alert className="mb-8 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <Database className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>حالت دمو:</strong> این یک نمایش از رابط کاربری است. برای استفاده واقعی، لطفاً Supabase را تنظیم کنید.
            <br />
            <code className="text-xs bg-blue-100 dark:bg-blue-800 px-1 rounded mt-1 inline-block">
              NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
          </AlertDescription>
        </Alert>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            خوش آمدید، {demoUser.profile.full_name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">داشبورد شخصی شما در پلتفرم هوش مصنوعی</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ایجنت‌های فعال</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{demoAgents.length}</div>
              <p className="text-xs text-muted-foreground">از حداکثر 10 ایجنت</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مکالمات</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{demoConversations.length}</div>
              <p className="text-xs text-muted-foreground">کل مکالمات انجام شده</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مصرف توکن</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{demoUser.profile.tokens_used}</div>
              <p className="text-xs text-muted-foreground">از {demoUser.profile.tokens_limit} توکن</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(demoUser.profile.tokens_used / demoUser.profile.tokens_limit) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Token</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-xs">
                دمو
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">برای استفاده از API</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/chat/demo">
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>شروع چت جدید</CardTitle>
                <CardDescription>با ایجنت‌های خود گفتگو کنید یا چت جدید شروع کنید</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/agents/demo">
              <CardHeader>
                <Bot className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>مدیریت ایجنت‌ها</CardTitle>
                <CardDescription>ایجنت‌های جدید بسازید یا موجودی‌ها را ویرایش کنید</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/settings/demo">
              <CardHeader>
                <Settings className="h-8 w-8 text-green-600 mb-2" />
                <CardTitle>تنظیمات</CardTitle>
                <CardDescription>تنظیمات حساب کاربری و API خود را مدیریت کنید</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Recent Agents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>ایجنت‌های اخیر</CardTitle>
              <CardDescription>ایجنت‌های اخیراً ساخته شده یا استفاده شده</CardDescription>
            </div>
            <Button disabled>
              <Plus className="ml-2 h-4 w-4" />
              ایجنت جدید (دمو)
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bot className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{agent.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{agent.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={agent.has_memory ? "default" : "secondary"}>
                      {agent.has_memory ? "حافظه فعال" : "حافظه غیرفعال"}
                    </Badge>
                    <Button size="sm" disabled>
                      چت (دمو)
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
