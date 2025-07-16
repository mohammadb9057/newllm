import { APITokenManager } from '@/components/api-token-manager'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function APITokensPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">مدیریت توکن‌های API</h1>
        <p className="text-muted-foreground mt-1">
          توکن‌های API خود را مدیریت کنید و از آن‌ها برای دسترسی به سرویس‌های ما استفاده کنید
        </p>
      </div>
      <APITokenManager />
    </DashboardLayout>
  )
}
