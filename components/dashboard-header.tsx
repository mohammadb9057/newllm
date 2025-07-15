'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  MessageSquare,
  FileText,
  Workflow,
  BarChart3,
  Key,
  Home
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'

interface DashboardHeaderProps {
  userTokens?: {
    used: number
    limit: number
    remaining: number
  }
}

export function DashboardHeader({ userTokens }: DashboardHeaderProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const navigationItems = [
    { href: '/', icon: Home, label: 'صفحه اصلی' },
    { href: '/dashboard', icon: BarChart3, label: 'داشبورد' },
    { href: '/chat', icon: MessageSquare, label: 'چت هوشمند' },
    { href: '/tools', icon: FileText, label: 'ابزارهای تحلیل' },
    { href: '/workflows', icon: Workflow, label: 'گردش کارها' },
    { href: '/api-tokens', icon: Key, label: 'توکن‌های API' },
  ]

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              پلتفرم هوش مصنوعی
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* User Menu and Token Info */}
          <div className="flex items-center gap-4">
            {/* Token Usage Badge */}
            {userTokens && (
              <Badge 
                variant={userTokens.remaining < 100 ? "destructive" : "secondary"}
                className="hidden sm:flex"
              >
                {userTokens.remaining.toLocaleString('fa-IR')} توکن باقی‌مانده
              </Badge>
            )}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Mobile Token Info */}
                {userTokens && (
                  <>
                    <DropdownMenuItem className="sm:hidden">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs text-muted-foreground">میزان استفاده توکن</span>
                        <span className="text-sm">
                          {userTokens.remaining.toLocaleString('fa-IR')} از {userTokens.limit.toLocaleString('fa-IR')} باقی‌مانده
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="sm:hidden" />
                  </>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>داشبورد</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/api-tokens" className="flex items-center">
                    <Key className="mr-2 h-4 w-4" />
                    <span>مدیریت توکن‌ها</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>تنظیمات</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>خروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

