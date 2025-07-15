"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity } from "lucide-react"

interface RequestLog {
  id: string
  user_id: string | null
  ip_address: string | null
  endpoint: string
  model_id: string | null
  tokens_used: number | null
  created_at: string
}

interface RequestLogsProps {
  logs: RequestLog[]
}

export function RequestLogs({ logs }: RequestLogsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          لاگ درخواست‌ها
        </CardTitle>
        <CardDescription>آخرین درخواست‌های API ثبت شده</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>زمان</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>مدل</TableHead>
              <TableHead>توکن‌ها</TableHead>
              <TableHead>کاربر</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.slice(0, 20).map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">{new Date(log.created_at).toLocaleString("fa-IR")}</TableCell>
                <TableCell className="font-mono text-sm">{log.ip_address || "نامشخص"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {log.endpoint}
                  </Badge>
                </TableCell>
                <TableCell>{log.model_id || "-"}</TableCell>
                <TableCell>{log.tokens_used || 0}</TableCell>
                <TableCell className="text-xs text-gray-500">
                  {log.user_id ? log.user_id.substring(0, 8) + "..." : "مهمان"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
