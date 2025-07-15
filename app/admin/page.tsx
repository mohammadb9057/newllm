import { requireAdmin } from "@/lib/auth"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { UserManagement } from "@/components/user-management"
import { SystemSettings } from "@/components/system-settings"
import { RequestLogs } from "@/components/request-logs"
import { Shield, Users, Settings, Activity, BarChart3 } from "lucide-react"
import type { Database } from "@/lib/supabase/types"

export default async function AdminPage() {
  const user = await requireAdmin()
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })

  // Get system statistics
  const [usersResult, agentsResult, conversationsResult, logsResult] = await Promise.all([
    supabase.from("users").select("*", { count: "exact" }),
    supabase.from("agents").select("*", { count: "exact" }),
    supabase.from("conversations").select("*", { count: "exact" }),
    supabase.from("request_logs").select("*", { count: "exact" }).order("created_at", { ascending: false }).limit(100),
  ])

  const stats = {
    totalUsers: usersResult.count || 0,
    totalAgents: agentsResult.count || 0,
    totalConversations: conversationsResult.count || 0,
    totalRequests: logsResult.count || 0,
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">پنل مدیریت سیستم</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">مدیریت کاربران، تنظیمات و نظارت بر سیستم</p>
        </div>

        {/* System Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل کاربران</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">کاربران ثبت‌نام شده</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل ایجنت‌ها</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAgents}</div>
              <p className="text-xs text-muted-foreground">ایجنت‌های ساخته شده</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل مکالمات</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversations}</div>
              <p className="text-xs text-muted-foreground">مکالمات انجام شده</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">درخواست‌های API</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">درخواست‌های ثبت شده</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="space-y-8">
          <UserManagement />
          <SystemSettings />
          <RequestLogs logs={logsResult.data || []} />
        </div>
      </main>
    </div>
  )
}
