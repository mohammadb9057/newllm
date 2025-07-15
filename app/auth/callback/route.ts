import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`)
      }

      if (data.user) {
        // Check if user profile exists, create if not
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError && profileError.code === "PGRST116") {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || data.user.email!.split("@")[0],
            api_token: `llm_${crypto.randomUUID().replace(/-/g, "").substring(0, 32)}`,
            tokens_used: 0,
            tokens_limit: 1000,
            is_admin: false,
          })

          if (insertError) {
            console.error("Error creating user profile:", insertError)
          }
        }

        return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
      }
    } catch (error) {
      console.error("Unexpected auth callback error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=unexpected_error`)
    }
  }

  // Return the user to login if no code
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
}
