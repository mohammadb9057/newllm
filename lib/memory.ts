import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./supabase/types"

export interface Memory {
  id: string
  agent_id: string
  user_id: string
  content: string
  metadata: any | null
  created_at: string
}

export class MemoryManager {
  private getSupabase() {
    const cookieStore = cookies()
    return createServerComponentClient<Database>({
      cookies: () => cookieStore,
    })
  }

  async getAgentMemories(agentId: string, userId: string): Promise<Memory[]> {
    const supabase = this.getSupabase()

    const { data, error } = await supabase
      .from("memory")
      .select("*")
      .eq("agent_id", agentId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching agent memories:", error)
      return []
    }

    return data || []
  }

  async addMemory(agentId: string, userId: string, content: string, metadata: any = null): Promise<Memory | null> {
    const supabase = this.getSupabase()

    const { data, error } = await supabase
      .from("memory")
      .insert({
        agent_id: agentId,
        user_id: userId,
        content,
        metadata,
      })
      .select()
      .single()

    if (error) {
      console.error("Error adding memory:", error)
      return null
    }

    return data
  }

  async deleteMemory(memoryId: string): Promise<boolean> {
    const supabase = this.getSupabase()

    const { error } = await supabase.from("memory").delete().eq("id", memoryId)

    if (error) {
      console.error("Error deleting memory:", error)
      return false
    }

    return true
  }

  formatMemoriesForPrompt(memories: Memory[]): string {
    if (memories.length === 0) {
      return ""
    }

    const memoryText = memories.map((memory) => memory.content).join("\n")

    return `\n\nحافظه قبلی:\n${memoryText}\n`
  }
}

export const memoryManager = new MemoryManager()
