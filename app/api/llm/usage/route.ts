import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/lib/supabase/types"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({
      cookies: () => cookieStore,
    })

    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, tokens_used, tokens_limit")
      .eq("api_token", token)
      .single()

    if (userError || !user) {
      console.error("User lookup error:", userError)
      return NextResponse.json({ error: "Invalid API token" }, { status: 401 })
    }

    return NextResponse.json({
      usage: {
        tokens_used: user.tokens_used,
        tokens_limit: user.tokens_limit,
        remaining_tokens: user.tokens_limit - user.tokens_used,
      },
      success: true,
    })
  } catch (error) {
    console.error("Usage API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
