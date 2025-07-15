"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()
  const isConfigured = isSupabaseConfigured()

  useEffect(() => {
    if (!isConfigured) {
      router.push("/dashboard/demo")
    }
  }, [isConfigured, router])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        setSuccess(true)
        toast({
          title: "ثبت نام موفق",
          description: "لطفاً ایمیل خود را برای تأیید حساب بررسی کنید",
        })

        // Auto redirect after 3 seconds
        setTimeout(() => {
          router.push("/auth/verify-email")
        }, 3000)
      }
    } catch (err) {
      setError("خطایی در ثبت نام رخ داد")
    } finally {
      setLoading(false)
    }
  }

  const handleTestRegister = async () => {
    // Generate random test data
    const randomId = Math.random().toString(36).substring(7)
    setEmail(`test${randomId}@example.com`)
    setPassword("testpassword123")
    setFullName(`کاربر تست ${randomId}`)
    setError("")

    toast({
      title: "اطلاعات تست",
      description: "اطلاعات تست تولید شد",
    })
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Supabase تنظیم نشده است. در حال انتقال به حالت دمو...</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Bot className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">ثبت نام</CardTitle>
          <CardDescription>حساب جدید در پلتفرم هوش مصنوعی بسازید</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-800 dark:text-green-200">ثبت نام موفق!</h3>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">ایمیل تأیید به آدرس {email} ارسال شد</p>
                <p className="text-xs text-green-500 mt-2">در حال انتقال به صفحه تأیید...</p>
              </div>
              <Button variant="outline" onClick={() => router.push("/auth/verify-email")} className="w-full">
                رفتن به صفحه تأیید ایمیل
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">نام کامل</Label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="نام کامل خود را وارد کنید"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="رمز عبور قوی انتخاب کنید"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-gray-500">حداقل 6 کاراکتر</p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    در حال ثبت نام...
                  </>
                ) : (
                  <>
                    ثبت نام
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Test Button for Development */}
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleTestRegister}
                  disabled={loading}
                >
                  🧪 تولید اطلاعات تست
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">برای تست سریع ثبت نام</p>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">قبلاً ثبت نام کرده‌اید؟ </span>
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              وارد شوید
            </Link>
          </div>

          {/* Development Info */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>وضعیت Supabase:</strong> {isConfigured ? "✅ تنظیم شده" : "❌ تنظیم نشده"}
            </p>
            {isConfigured && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                <strong>Auth URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
