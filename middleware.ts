import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { user } } = await supabase.auth.getUser()

  // Protect routes that require authentication
  if (!user && (
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/chat') ||
    req.nextUrl.pathname.startsWith('/tools') ||
    req.nextUrl.pathname.startsWith('/personalization') ||
    req.nextUrl.pathname.startsWith('/analytics') ||
    req.nextUrl.pathname.startsWith('/workflows')
  )) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Redirect authenticated users from login/signup pages to dashboard
  if (user && (
    req.nextUrl.pathname.startsWith('/auth/login') ||
    req.nextUrl.pathname.startsWith('/auth/signup')
  )) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*', // Protect dashboard and its sub-routes
    '/chat/:path*',      // Protect chat and its sub-routes
    '/tools/:path*',     // Protect tools and its sub-routes
    '/personalization/:path*', // Protect personalization and its sub-routes
    '/analytics/:path*', // Protect analytics and its sub-routes
    '/workflows/:path*', // Protect workflows and its sub-routes
    '/api-tokens/:path*', // Protect API tokens management
    '/auth/login',       // Redirect authenticated users from login
    '/auth/signup',      // Redirect authenticated users from signup
  ],
}


