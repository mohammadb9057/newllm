"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, Settings, LogOut, User, Shield } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  user: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <header className="border-b bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Bot className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">پلتفرم هوش مصنوعی</h1>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            داشبورد
          </Link>
          <Link href="/chat" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            چت
          </Link>
          <Link href="/agents" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            ایجنت‌ها
          </Link>
          {user.profile?.is_admin && (
            <Link href="/admin" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              مدیریت
            </Link>
          )}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profile?.avatar_url || "/placeholder.svg"} alt={user.profile?.full_name} />
                <AvatarFallback>{user.profile?.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.profile?.full_name || "کاربر"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User className="ml-2 h-4 w-4" />
                <span>پروفایل</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="ml-2 h-4 w-4" />
                <span>تنظیمات</span>
              </Link>
            </DropdownMenuItem>
            {user.profile?.is_admin && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <Shield className="ml-2 h-4 w-4" />
                  <span>پنل مدیریت</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="ml-2 h-4 w-4" />
              <span>خروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
