"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Trash2, Copy } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface AgentActionsProps {
  agent: {
    id: string
    name: string
    description: string | null
    system_prompt: string | null
    model_preference: string
    memory_enabled: boolean
    is_active: boolean
  }
}

export function AgentActions({ agent }: AgentActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseClient()
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.from("agents").delete().eq("id", agent.id)

      if (error) {
        throw error
      }

      toast({
        title: "ایجنت حذف شد",
        description: `ایجنت "${agent.name}" با موفقیت حذف شد`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error deleting agent:", error)
      toast({
        title: "خطا",
        description: "خطا در حذف ایجنت",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const handleDuplicate = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.from("agents").insert({
        name: `${agent.name} (کپی)`,
        description: agent.description,
        system_prompt: agent.system_prompt,
        model_preference: agent.model_preference,
        memory_enabled: agent.memory_enabled,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      })

      if (error) {
        throw error
      }

      toast({
        title: "ایجنت کپی شد",
        description: `کپی از ایجنت "${agent.name}" ساخته شد`,
      })

      router.refresh()
    } catch (error) {
      console.error("Error duplicating agent:", error)
      toast({
        title: "خطا",
        description: "خطا در کپی کردن ایجنت",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/agents/${agent.id}/edit`}>
              <Edit className="ml-2 h-4 w-4" />
              ویرایش
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate} disabled={loading}>
            <Copy className="ml-2 h-4 w-4" />
            کپی
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
            <Trash2 className="ml-2 h-4 w-4" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف ایجنت</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید ایجنت "{agent.name}" را حذف کنید؟ این عمل قابل بازگشت نیست و تمام حافظه‌های
              مرتبط با این ایجنت نیز حذف خواهند شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? "در حال حذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
