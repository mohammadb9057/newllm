"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"

interface RegenerateTokenButtonProps {
  userId: string
}

export function RegenerateTokenButton({ userId }: RegenerateTokenButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleRegenerate = async () => {
    setLoading(true)
    try {
      // Generate new token
      const newToken = `llm_${crypto.randomUUID().replace(/-/g, "").substring(0, 32)}`

      const { error } = await supabase.from("users").update({ api_token: newToken }).eq("id", userId)

      if (error) throw error

      toast({
        title: "توکن جدید تولید شد",
        description: "کلید API جدید تولید شد. صفحه را رفرش کنید.",
      })

      // Refresh the page to show new token
      router.refresh()
    } catch (error) {
      console.error("Error regenerating token:", error)
      toast({
        title: "خطا",
        description: "خطا در تولید توکن جدید",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleRegenerate} disabled={loading}>
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
    </Button>
  )
}
