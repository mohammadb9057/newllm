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
import { Bot, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseClient()
  const isConfigured = isSupabaseConfigured()

  useEffect(() => {
    if (!isConfigured) {
      router.push("/dashboard/demo")
    }
  }, [isConfigured, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        toast({
          title: "ورود موفق",
          description: "به پلتفرم هوش مصنوعی خوش آمدید",
        })

        router.push("/dashboard")
      }
    } catch (err) {
      setError("خطایی در ورود رخ داد")
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError("لطفاً ایمیل خود را وارد کنید")
      return
    }

    if (!supabase) return

    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setMagicLinkSent(true)
        toast({
          title: "لینک ورود ارسال شد",
          description: "لطفاً ایمیل خود را بررسی کنید",
        })
      }
    } catch (err) {
      setError("خطایی در ارسال لینک رخ داد")
    } finally {
      setLoading(false)
    }
  }

  const handleTestLogin = async () => {
    // Test with demo credentials
    setEmail("test@example.com")
    setPassword("testpassword123")
    setError("")

    toast({
      title: "اطلاعات تست",
      description: "ایمیل و رمز عبور تست وارد شد",
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
          <CardTitle className="text-2xl">ورود به حساب</CardTitle>
          <CardDescription>به پلتفرم هوش مصنوعی خوش آمدید</CardDescription>
        </CardHeader>
        <CardContent>
          {magicLinkSent ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-800 dark:text-green-200">لینک ورود ارسال شد</h3>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  لطفاً ایمیل خود را بررسی کنید و روی لینک کلیک کنید
                </p>
              </div>
              <Button variant="outline" onClick={() => setMagicLinkSent(false)} className="w-full">
                بازگشت به فرم ورود
              </Button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
                    placeholder="رمز عبور خود را وارد کنید"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    در حال ورود...
                  </>
                ) : (
                  <>
                    ورود
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">یا</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={handleMagicLink}
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                ورود با لینک جادویی
              </Button>

              {/* Test Button for Development */}
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleTestLogin}
                  disabled={loading}
                >
                  🧪 پر کردن اطلاعات تست
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">برای تست سریع authentication</p>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">حساب کاربری ندارید؟ </span>
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              ثبت نام کنید
            </Link>
          </div>

          {/* Development Info */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>وضعیت Supabase:</strong> {isConfigured ? "✅ تنظیم شده" : "❌ تنظیم نشده"}
            </p>
            {isConfigured && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
