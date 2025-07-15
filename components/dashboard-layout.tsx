'use client'

import { ReactNode, useEffect, useState } from 'react'
import { DashboardHeader } from './dashboard-header'
import { useAuth } from './auth-provider'

interface DashboardLayoutProps {
  children: ReactNode
}

interface UserTokens {
  used: number
  limit: number
  remaining: number
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth()
  const [userTokens, setUserTokens] = useState<UserTokens | null>(null)

  useEffect(() => {
    if (user?.api_token) {
      fetchUserTokens()
    }
  }, [user])

  const fetchUserTokens = async () => {
    if (!user?.api_token) return

    try {
      const response = await fetch('/api/llm/usage', {
        headers: {
          'Authorization': `Bearer ${user.api_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.usage) {
          setUserTokens({
            used: data.usage.tokens_used,
            limit: data.usage.tokens_limit,
            remaining: data.usage.remaining_tokens
          })
        }
      }
    } catch (error) {
      console.error('Error fetching user tokens:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DashboardHeader userTokens={userTokens || undefined} />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}

