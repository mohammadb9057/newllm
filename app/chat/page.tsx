import { PersianLLMChat } from '@/components/persian-llm-chat'

export default function ChatPage() {
  return (
    <div className="container mx-auto h-screen flex flex-col">
      <div className="flex-1 py-6">
        <PersianLLMChat />
      </div>
    </div>
  )
}

