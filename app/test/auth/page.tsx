import { AuthTestPanel } from "@/components/auth-test-panel"
import { DashboardHeader } from "@/components/dashboard-header"
import { getUser } from "@/lib/auth"

export default async function AuthTestPage() {
  const user = await getUser()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {user && <DashboardHeader user={user} />}

      <main className="container mx-auto px-4 py-8 flex items-center justify-center">
        <AuthTestPanel />
      </main>
    </div>
  )
}
