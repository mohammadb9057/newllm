"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Search, Shield } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  name: string | null
  tokens_used: number
  tokens_limit: number
  is_admin: boolean
  created_at: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = getSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "خطا",
        description: "خطا در بارگذاری کاربران",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("users").update({ is_admin: !currentStatus }).eq("id", userId)

      if (error) throw error

      setUsers(users.map((user) => (user.id === userId ? { ...user, is_admin: !currentStatus } : user)))

      toast({
        title: "تغییر وضعیت",
        description: `وضعیت مدیریت کاربر ${!currentStatus ? "فعال" : "غیرفعال"} شد`,
      })
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "خطا",
        description: "خطا در تغییر وضعیت کاربر",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          مدیریت کاربران
        </CardTitle>
        <CardDescription>مدیریت کاربران سیستم و تنظیم دسترسی‌ها</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="جستجو در کاربران..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">در حال بارگذاری...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>کاربر</TableHead>
                  <TableHead>ایمیل</TableHead>
                  <TableHead>توکن‌ها</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>تاریخ عضویت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name || "بدون نام"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {user.tokens_used.toLocaleString()} / {user.tokens_limit.toLocaleString()}
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full"
                            style={{
                              width: `${Math.min(100, (user.tokens_used / user.tokens_limit) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_admin ? "default" : "secondary"}>
                        {user.is_admin ? "مدیر" : "کاربر"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString("fa-IR")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => toggleAdminStatus(user.id, user.is_admin)}>
                          <Shield className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
