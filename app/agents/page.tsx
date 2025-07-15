import { requireAuth } from "@/lib/auth"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Plus, Edit, MessageSquare, Brain, Settings } from "lucide-react"
import Link from "next/link"
import { DashboardHeader } from "@/components/dashboard-header"
import { AgentActions } from "@/components/agent-actions"
import type { Database } from "@/lib/supabase/types"

export default async function AgentsPage() {
  const user = await requireAuth()
  const cookieStore = cookies()
  const supabase = createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })

  const { data: agents, error } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching agents:", error)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ایجنت‌های من</h1>
            <p className="text-gray-600 dark:text-gray-400">ایجنت‌های هوش مصنوعی خود را مدیریت کنید</p>
          </div>
          <Link href="/agents/new">
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              ایجنت جدید
            </Button>
          </Link>
        </div>

        {agents && agents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Bot className="h-8 w-8 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription className="mt-1">{agent.description || "بدون توضیحات"}</CardDescription>
                      </div>
                    </div>
                    <AgentActions agent={agent} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>مدل:</span>
                      <Badge variant="outline">{agent.model_id}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {agent.has_memory ? (
                        <Badge variant="default" className="text-xs">
                          <Brain className="ml-1 h-3 w-3" />
                          {agent.memory_type}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          بدون حافظه
                        </Badge>
                      )}

                      {agent.is_active ? (
                        <Badge variant="default" className="text-xs">
                          فعال
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          غیرفعال
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/chat?agent=${agent.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <MessageSquare className="ml-2 h-4 w-4" />
                          چت
                        </Button>
                      </Link>
                      <Link href={`/agents/${agent.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/agents/${agent.id}/memory`}>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">هنوز ایجنتی ندارید</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                اولین ایجنت هوش مصنوعی خود را بسازید و تجربه‌ای منحصر به فرد داشته باشید
              </p>
              <Link href="/agents/new">
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  ساخت ایجنت جدید
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
