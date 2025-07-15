import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Generate a new API token
    const newToken = `llm_${crypto.randomUUID().replace(/-/g, "").substring(0, 32)}`

    // Update the user's API token in the database
    const { error: updateError } = await supabase
      .from("users")
      .update({ api_token: newToken })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating API token:", updateError)
      return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
    }

    return NextResponse.json({ 
      token: newToken,
      message: "Token generated successfully" 
    })

  } catch (error) {
    console.error("Token generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's current API token
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("api_token")
      .eq("id", user.id)
      .single()

    if (fetchError) {
      console.error("Error fetching user token:", fetchError)
      return NextResponse.json({ error: "Failed to fetch token" }, { status: 500 })
    }

    return NextResponse.json({ 
      token: userData.api_token,
      api_base: `${request.nextUrl.origin}/api/llm`
    })

  } catch (error) {
    console.error("Token fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

