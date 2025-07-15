"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: "کپی شد",
        description: "متن در کلیپ‌بورد کپی شد",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در کپی کردن متن",
        variant: "destructive",
      })
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}
