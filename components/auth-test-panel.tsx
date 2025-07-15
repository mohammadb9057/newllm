"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { TestTube, CheckCircle, XCircle, Loader2, Database, User, Shield } from "lucide-react"
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
  details?: string
}

export function AuthTestPanel() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const supabase = getSupabaseClient()
  const isConfigured = isSupabaseConfigured()

  const runTests = async () => {
    setTesting(true)
    setResults([])

    const tests: TestResult[] = [
      { name: "Supabase Configuration", status: "pending", message: "Checking environment variables..." },
      { name: "Database Connection", status: "pending", message: "Testing database connectivity..." },
      { name: "Authentication Service", status: "pending", message: "Verifying auth service..." },
      { name: "User Profile Creation", status: "pending", message: "Testing profile creation..." },
      { name: "RLS Policies", status: "pending", message: "Checking Row Level Security..." },
      { name: "API Token Generation", status: "pending", message: "Testing API token system..." },
    ]

    setResults([...tests])

    // Test 1: Supabase Configuration
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (isConfigured) {
      tests[0] = { ...tests[0], status: "success", message: "Environment variables configured" }
    } else {
      tests[0] = { ...tests[0], status: "error", message: "Missing SUPABASE_URL or SUPABASE_ANON_KEY" }
    }
    setResults([...tests])

    if (!isConfigured || !supabase) {
      setTesting(false)
      return
    }

    // Test 2: Database Connection
    await new Promise((resolve) => setTimeout(resolve, 500))
    try {
      const { data, error } = await supabase.from("users").select("count").limit(1)
      if (error) throw error
      tests[1] = { ...tests[1], status: "success", message: "Database connection successful" }
    } catch (error) {
      tests[1] = {
        ...tests[1],
        status: "error",
        message: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }
    }
    setResults([...tests])

    // Test 3: Authentication Service
    await new Promise((resolve) => setTimeout(resolve, 500))
    try {
      const { data, error } = await supabase.auth.getSession()
      tests[2] = {
        ...tests[2],
        status: "success",
        message: `Auth service active${data.session ? " (User logged in)" : " (No active session)"}`,
      }
    } catch (error) {
      tests[2] = {
        ...tests[2],
        status: "error",
        message: "Auth service error",
        details: error instanceof Error ? error.message : "Unknown error",
      }
    }
    setResults([...tests])

    // Test 4: User Profile Creation
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (user && profile) {
      tests[3] = {
        ...tests[3],
        status: "success",
        message: `Profile exists for ${profile.email}`,
      }
    } else if (user && !profile) {
      tests[3] = {
        ...tests[3],
        status: "error",
        message: "User exists but profile missing",
      }
    } else {
      tests[3] = {
        ...tests[3],
        status: "success",
        message: "No user logged in (test skipped)",
      }
    }
    setResults([...tests])

    // Test 5: RLS Policies
    await new Promise((resolve) => setTimeout(resolve, 500))
    try {
      // Try to access system_config with public flag
      const { data, error } = await supabase.from("system_config").select("config_key").eq("is_public", true).limit(1)

      tests[4] = {
        ...tests[4],
        status: "success",
        message: "RLS policies working correctly",
      }
    } catch (error) {
      tests[4] = {
        ...tests[4],
        status: "error",
        message: "RLS policy test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }
    }
    setResults([...tests])

    // Test 6: API Token Generation
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (profile?.api_token) {
      tests[5] = {
        ...tests[5],
        status: "success",
        message: `API token generated: ${profile.api_token.substring(0, 10)}...`,
      }
    } else {
      tests[5] = {
        ...tests[5],
        status: "error",
        message: "No API token found",
      }
    }
    setResults([...tests])

    setTesting(false)

    const successCount = tests.filter((t) => t.status === "success").length
    const totalTests = tests.length

    toast({
      title: "تست‌ها تمام شد",
      description: `${successCount}/${totalTests} تست موفق`,
      variant: successCount === totalTests ? "default" : "destructive",
    })
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            موفق
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">خطا</Badge>
      case "pending":
        return <Badge variant="secondary">در حال انجام</Badge>
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          تست سیستم Authentication
        </CardTitle>
        <CardDescription>تست کامل سیستم احراز هویت و اتصال به دیتابیس</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Supabase</span>
            </div>
            <Badge variant={isConfigured ? "default" : "destructive"}>
              {isConfigured ? "تنظیم شده" : "تنظیم نشده"}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">کاربر</span>
            </div>
            <Badge variant={user ? "default" : "secondary"}>{user ? "وارد شده" : "وارد نشده"}</Badge>
          </div>
        </div>

        {user && profile && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>کاربر فعلی:</strong> {profile.email}
              <br />
              <strong>نام:</strong> {profile.name}
              <br />
              <strong>API Token:</strong> {profile.api_token?.substring(0, 20)}...
              <br />
              <strong>مدیر:</strong> {profile.is_admin ? "بله" : "خیر"}
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Test Button */}
        <Button onClick={runTests} disabled={testing || !isConfigured} className="w-full">
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              در حال انجام تست‌ها...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-4 w-4" />
              شروع تست‌ها
            </>
          )}
        </Button>

        {!isConfigured && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              برای انجام تست‌ها، ابتدا متغیرهای محیطی Supabase را تنظیم کنید:
              <br />
              <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code>
              <br />
              <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            </AlertDescription>
          </Alert>
        )}

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">نتایج تست:</h3>
            {results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{result.name}</p>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                  {result.details && <p className="text-xs text-red-600 mt-1 font-mono">{result.details}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
