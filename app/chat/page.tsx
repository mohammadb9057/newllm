import { PersianLLMChat } from '@/components/persian-llm-chat'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function ChatPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">چت هوشمند</h1>
        <p className="text-muted-foreground mt-1">
          با مدل‌های زبانی پیشرفته گفتگو کنید
        </p>
      </div>
      <PersianLLMChat />
    </DashboardLayout>
  )
}