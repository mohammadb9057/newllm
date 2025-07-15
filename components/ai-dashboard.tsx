'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Brain, 
  MessageSquare, 
  FileText, 
  Languages, 
  TrendingUp, 
  Users, 
  Clock,
  Zap,
  Target,
  Activity
} from 'lucide-react'

interface UsageStats {
  totalRequests: number
  successRate: number
  avgResponseTime: number
  activeUsers: number
  popularModels: { name: string; usage: number; color: string }[]
  dailyUsage: { date: string; requests: number; users: number }[]
  featureUsage: { feature: string; count: number }[]
}

export function AIDashboard() {
  const [stats, setStats] = useState<UsageStats>({
    totalRequests: 12847,
    successRate: 98.5,
    avgResponseTime: 1.2,
    activeUsers: 342,
    popularModels: [
      { name: 'GPT-4 Persian', usage: 45, color: '#8884d8' },
      { name: 'PersianMind', usage: 30, color: '#82ca9d' },
      { name: 'Maral-7B', usage: 25, color: '#ffc658' }
    ],
    dailyUsage: [
      { date: '1403/04/20', requests: 1200, users: 45 },
      { date: '1403/04/21', requests: 1350, users: 52 },
      { date: '1403/04/22', requests: 1100, users: 48 },
      { date: '1403/04/23', requests: 1450, users: 58 },
      { date: '1403/04/24', requests: 1600, users: 62 },
      { date: '1403/04/25', requests: 1380, users: 55 },
      { date: '1403/04/26', requests: 1520, users: 60 }
    ],
    featureUsage: [
      { feature: 'چت هوشمند', count: 5200 },
      { feature: 'تحلیل احساسات', count: 3100 },
      { feature: 'خلاصه‌سازی', count: 2800 },
      { feature: 'ترجمه', count: 1900 }
    ]
  })

  const [isLoading, setIsLoading] = useState(false)

  const refreshStats = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">داشبورد هوش مصنوعی</h1>
          <p className="text-muted-foreground mt-1">
            نظارت بر عملکرد و آمار استفاده از سیستم
          </p>
        </div>
        <Button onClick={refreshStats} disabled={isLoading}>
          {isLoading ? 'در حال بروزرسانی...' : 'بروزرسانی'}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل درخواست‌ها</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString('fa-IR')}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> نسبت به ماه گذشته
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نرخ موفقیت</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <Progress value={stats.successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">زمان پاسخ متوسط</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.3s</span> بهبود یافته
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کاربران فعال</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> افزایش هفتگی
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">آمار استفاده</TabsTrigger>
          <TabsTrigger value="models">مدل‌های محبوب</TabsTrigger>
          <TabsTrigger value="features">ویژگی‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>روند استفاده روزانه</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="درخواست‌ها"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="کاربران"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مدل‌های محبوب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.popularModels}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usage"
                    >
                      {stats.popularModels.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-4">
                  {stats.popularModels.map((model, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: model.color }}
                        />
                        <span className="font-medium">{model.name}</span>
                      </div>
                      <Badge variant="secondary">{model.usage}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>استفاده از ویژگی‌ها</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.featureUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              وضعیت سیستم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>سرور اصلی</span>
              <Badge className="bg-green-100 text-green-800">آنلاین</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>پایگاه داده</span>
              <Badge className="bg-green-100 text-green-800">سالم</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>API Gateway</span>
              <Badge className="bg-green-100 text-green-800">فعال</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>کش سیستم</span>
              <Badge className="bg-yellow-100 text-yellow-800">در حال بهینه‌سازی</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              عملکرد سیستم
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>استفاده از CPU</span>
                <span>45%</span>
              </div>
              <Progress value={45} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>استفاده از حافظه</span>
                <span>62%</span>
              </div>
              <Progress value={62} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>فضای ذخیره‌سازی</span>
                <span>38%</span>
              </div>
              <Progress value={38} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>ترافیک شبکه</span>
                <span>71%</span>
              </div>
              <Progress value={71} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

