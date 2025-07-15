import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Brain, MessageSquare, Shield, Zap, Users, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getUser } from "@/lib/auth"
import { isSupabaseConfigured } from "@/lib/supabase/client"

export default async function HomePage() {
  const isConfigured = isSupabaseConfigured()
  const user = await getUser()

  // For demo purposes, we'll show a demo user state
  const demoUser = !isConfigured ? { id: "demo", email: "demo@example.com" } : user

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">پلتفرم هوش مصنوعی</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/chat">
              <Button variant="ghost">چت هوشمند</Button>
            </Link>
            <Link href="/tools">
              <Button variant="ghost">ابزارهای تحلیل</Button>
            </Link>
            <Link href="/workflows">
              <Button variant="ghost">گردش کارها</Button>
            </Link>
            <Link href="/personalization">
              <Button variant="ghost">شخصی‌سازی</Button>
            </Link>
            <Link href="/analytics">
              <Button variant="ghost">تحلیل پیش‌بینی</Button>
            </Link>
            <Link href="/api-tokens">
              <Button variant="ghost">توکن‌های API</Button>
            </Link>
            {demoUser ? (
              <Link href="/dashboard">
                <Button>داشبورد{demoUser.id === "demo" ? " (دمو)" : ""}</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">ورود</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>ثبت نام</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Demo Mode Alert */}
      {!isConfigured && (
        <div className="container mx-auto px-4 py-4">
          <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>حالت دمو:</strong> برای استفاده کامل، لطفاً متغیرهای محیطی Supabase را تنظیم کنید.
              <br />
              <code className="text-xs bg-yellow-100 dark:bg-yellow-800 px-1 rounded">
                NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            🚀 پلتفرم پیشرفته هوش مصنوعی
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            ایجنت‌های هوش مصنوعی
            <br />
            <span className="text-blue-600">شخصی‌سازی شده</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            با استفاده از قدرتمندترین مدل‌های هوش مصنوعی، ایجنت‌های شخصی خود را بسازید و با حافظه پایدار و قابلیت‌های
            پیشرفته تجربه‌ای منحصر به فرد داشته باشید.
          </p>
          <div className="flex gap-4 justify-center">
            {demoUser ? (
              <Link href="/chat">
                <Button size="lg" className="text-lg px-8">
                  <MessageSquare className="ml-2 h-5 w-5" />
                  شروع چت{demoUser.id === "demo" ? " (دمو)" : ""}
                </Button>
              </Link>
            ) : (
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8">
                  <Zap className="ml-2 h-5 w-5" />
                  شروع رایگان
                </Button>
              </Link>
            )}
            <Link href="/docs">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                مستندات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">ویژگی‌های کلیدی</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Bot className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>ایجنت‌های شخصی</CardTitle>
                <CardDescription>ایجنت‌های هوش مصنوعی با شخصیت و رفتار دلخواه خود بسازید</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>حافظه پایدار</CardTitle>
                <CardDescription>
                  ایجنت‌های شما اطلاعات مهم را به خاطر می‌سپارند و در مکالمات بعدی استفاده می‌کنند
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>چت پیشرفته</CardTitle>
                <CardDescription>رابط چت مدرن با پشتیبانی از مارک‌داون، کد و فرمت‌های مختلف</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>امنیت بالا</CardTitle>
                <CardDescription>احراز هویت قوی و حفاظت کامل از اطلاعات شخصی کاربران</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>عملکرد سریع</CardTitle>
                <CardDescription>پاسخ‌دهی فوری با استفاده از بهترین مدل‌های هوش مصنوعی موجود</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>مدیریت کاربران</CardTitle>
                <CardDescription>داشبورد کامل برای مدیریت کاربران، آمار و تنظیمات سیستم</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">آماده شروع هستید؟</h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            همین الان ثبت نام کنید و اولین ایجنت هوش مصنوعی خود را بسازید
          </p>
          {!demoUser && (
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8">
                ثبت نام رایگان
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 پلتفرم هوش مصنوعی. تمامی حقوق محفوظ است.</p>
          {!isConfigured && (
            <p className="text-sm mt-2 text-yellow-600">🚧 حالت دمو - برای استفاده کامل Supabase را تنظیم کنید</p>
          )}
        </div>
      </footer>
    </div>
  )
}
