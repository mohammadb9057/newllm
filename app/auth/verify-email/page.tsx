"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [verified, setVerified] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = getSupabaseClient()
  const isConfigured = isSupabaseConfigured()

  useEffect(() => {
    if (!isConfigured) {
      router.push("/dashboard/demo")
      return
    }

    const handleEmailVerification = async () => {
      const token = searchParams.get("token")
      const type = searchParams.get("type")

      if (token && type === "signup" && supabase) {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: "signup",
          })

          if (error) {
            setError(error.message)
          } else if (data.user) {
            setVerified(true)
            toast({
              title: "ایمیل تأیید شد",
              description: "حساب شما با موفقیت فعال شد",
            })

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push("/dashboard")
            }, 2000)
          }
        } catch (err) {
          setError("خطا در تأیید ایمیل")
        }
      }

      setLoading(false)
    }

    handleEmailVerification()
  }, [searchParams, router, supabase, isConfigured, toast])

  const resendVerification = async () => {
    if (!supabase) return

    setLoading(true)
    try {
      // This would need the user's email - in a real app, you'd store this
      toast({
        title: "ارسال مجدد",
        description: "برای ارسال مجدد، لطفاً دوباره ثبت نام کنید",
      })
    } catch (err) {
      setError("خطا در ارسال مجدد")
    } finally {
      setLoading(false)
    }
  }

  if (!isConfigured) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Bot className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">تأیید ایمیل</CardTitle>
          <CardDescription>تأیید آدرس ایمیل شما</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {loading ? (
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">در حال تأیید ایمیل...</p>
            </div>
          ) : verified ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium text-green-800 dark:text-green-200">ایمیل تأیید شد!</h3>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">حساب شما با موفقیت فعال شد</p>
                <p className="text-xs text-green-500 mt-2">در حال انتقال به داشبورد...</p>
              </div>
              <Link href="/dashboard">
                <Button className="w-full">ورود به داشبورد</Button>
              </Link>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Button onClick={resendVerification} variant="outline" className="w-full bg-transparent">
                  ارسال مجدد ایمیل تأیید
                </Button>
                <Link href="/auth/register">
                  <Button variant="ghost" className="w-full">
                    بازگشت به ثبت نام
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium text-blue-800 dark:text-blue-200">ایمیل خود را بررسی کنید</h3>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">لینک تأیید به ایمیل شما ارسال شده است</p>
              </div>
              <div className="space-y-2">
                <Button onClick={resendVerification} variant="outline" className="w-full bg-transparent">
                  ارسال مجدد ایمیل
                </Button>
                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full">
                    بازگشت به ورود
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Development Info */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>Debug Info:</strong>
            </p>
            <p className="text-xs text-gray-500 mt-1">Token: {searchParams.get("token") ? "✅ موجود" : "❌ ندارد"}</p>
            <p className="text-xs text-gray-500">Type: {searchParams.get("type") || "نامشخص"}</p>
            <p className="text-xs text-gray-500">Supabase: {isConfigured ? "✅ فعال" : "❌ غیرفعال"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
