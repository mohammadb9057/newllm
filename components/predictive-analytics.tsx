'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts'
import { 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Zap, 
  Brain,
  Clock,
  Users,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

interface Prediction {
  id: string
  type: 'usage' | 'performance' | 'user_behavior' | 'system_health'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  timeframe: string
  trend: 'up' | 'down' | 'stable'
  value: number
  unit: string
}

interface TrendData {
  date: string
  actual: number
  predicted: number
  confidence_upper: number
  confidence_lower: number
}

export function PredictiveAnalytics() {
  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: '1',
      type: 'usage',
      title: 'افزایش استفاده از چت هوشمند',
      description: 'بر اساس روند فعلی، استفاده از چت هوشمند در ماه آینده 25% افزایش خواهد یافت',
      confidence: 87,
      impact: 'high',
      timeframe: '30 روز آینده',
      trend: 'up',
      value: 25,
      unit: '%'
    },
    {
      id: '2',
      type: 'performance',
      title: 'کاهش زمان پاسخ سیستم',
      description: 'با بهینه‌سازی‌های اخیر، زمان پاسخ متوسط 15% کاهش خواهد یافت',
      confidence: 92,
      impact: 'medium',
      timeframe: '14 روز آینده',
      trend: 'down',
      value: 15,
      unit: '%'
    },
    {
      id: '3',
      type: 'user_behavior',
      title: 'تغییر الگوی استفاده کاربران',
      description: 'کاربران بیشتر به سمت ابزارهای تحلیل متن گرایش پیدا خواهند کرد',
      confidence: 73,
      impact: 'medium',
      timeframe: '60 روز آینده',
      trend: 'up',
      value: 40,
      unit: '%'
    },
    {
      id: '4',
      type: 'system_health',
      title: 'نیاز به ارتقای سرور',
      description: 'با افزایش ترافیک، ظرفیت سرور در 45 روز آینده به حد اشباع خواهد رسید',
      confidence: 81,
      impact: 'high',
      timeframe: '45 روز آینده',
      trend: 'up',
      value: 95,
      unit: '%'
    }
  ])

  const [trendData, setTrendData] = useState<TrendData[]>([
    { date: '1403/04/20', actual: 1200, predicted: 1180, confidence_upper: 1250, confidence_lower: 1100 },
    { date: '1403/04/21', actual: 1350, predicted: 1320, confidence_upper: 1400, confidence_lower: 1240 },
    { date: '1403/04/22', actual: 1100, predicted: 1150, confidence_upper: 1220, confidence_lower: 1080 },
    { date: '1403/04/23', actual: 1450, predicted: 1420, confidence_upper: 1500, confidence_lower: 1340 },
    { date: '1403/04/24', actual: 1600, predicted: 1580, confidence_upper: 1650, confidence_lower: 1510 },
    { date: '1403/04/25', actual: null, predicted: 1720, confidence_upper: 1800, confidence_lower: 1640 },
    { date: '1403/04/26', actual: null, predicted: 1850, confidence_upper: 1950, confidence_lower: 1750 },
    { date: '1403/04/27', actual: null, predicted: 1980, confidence_upper: 2100, confidence_lower: 1860 }
  ])

  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const runPredictiveAnalysis = async () => {
    setIsAnalyzing(true)
    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsAnalyzing(false)
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getImpactText = (impact: string) => {
    switch (impact) {
      case 'high': return 'تأثیر بالا'
      case 'medium': return 'تأثیر متوسط'
      case 'low': return 'تأثیر کم'
      default: return 'نامشخص'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'usage': return <Users className="h-5 w-5 text-blue-600" />
      case 'performance': return <Zap className="h-5 w-5 text-yellow-600" />
      case 'user_behavior': return <Brain className="h-5 w-5 text-purple-600" />
      case 'system_health': return <Activity className="h-5 w-5 text-green-600" />
      default: return <Target className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            تحلیل پیش‌بینی‌کننده
          </h1>
          <p className="text-muted-foreground mt-1">
            پیش‌بینی روندها و الگوهای آینده با استفاده از یادگیری ماشین
          </p>
        </div>
        <Button 
          onClick={runPredictiveAnalysis} 
          disabled={isAnalyzing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isAnalyzing ? 'در حال تحلیل...' : 'تحلیل جدید'}
        </Button>
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Brain className="h-6 w-6 text-blue-600 animate-pulse" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span>تحلیل داده‌ها و پیش‌بینی روندها</span>
                  <span>در حال پردازش...</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictions">پیش‌بینی‌ها</TabsTrigger>
          <TabsTrigger value="trends">روند آینده</TabsTrigger>
          <TabsTrigger value="recommendations">توصیه‌های عملیاتی</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictions.map((prediction) => (
              <Card key={prediction.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(prediction.type)}
                      <div>
                        <CardTitle className="text-lg">{prediction.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getImpactColor(prediction.impact)}>
                            {getImpactText(prediction.impact)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {prediction.timeframe}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(prediction.trend)}
                      <span className="text-lg font-bold">
                        {prediction.value}{prediction.unit}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {prediction.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>اعتماد به پیش‌بینی</span>
                      <span>{prediction.confidence}%</span>
                    </div>
                    <Progress value={prediction.confidence} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>روند استفاده و پیش‌بینی آینده</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="confidence_upper"
                    stackId="1"
                    stroke="none"
                    fill="#e3f2fd"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="confidence_lower"
                    stackId="1"
                    stroke="none"
                    fill="#ffffff"
                    fillOpacity={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#2196f3"
                    strokeWidth={2}
                    dot={{ fill: '#2196f3', strokeWidth: 2, r: 4 }}
                    name="داده‌های واقعی"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#ff9800"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#ff9800', strokeWidth: 2, r: 4 }}
                    name="پیش‌بینی"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">روند کلی</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUp className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-bold text-green-600">+32%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  رشد پیش‌بینی شده در 30 روز آینده
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">دقت پیش‌بینی</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-bold text-blue-600">89%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  دقت متوسط پیش‌بینی‌های اخیر
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">بازه اطمینان</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <span className="text-lg font-bold text-purple-600">±12%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  حاشیه خطای پیش‌بینی
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                بر اساس تحلیل‌های انجام شده، توصیه‌های زیر برای بهبود عملکرد سیستم ارائه می‌شود.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    اقدامات فوری
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border-l-4 border-red-500 bg-red-50">
                    <h4 className="font-medium text-red-800">ارتقای ظرفیت سرور</h4>
                    <p className="text-sm text-red-700 mt-1">
                      با توجه به پیش‌بینی افزایش 95% استفاده، ظرفیت سرور باید تا 2 هفته آینده ارتقا یابد.
                    </p>
                  </div>
                  <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                    <h4 className="font-medium text-yellow-800">بهینه‌سازی کش</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      پیاده‌سازی سیستم کش پیشرفته برای کاهش زمان پاسخ.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    برنامه‌ریزی بلندمدت
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                    <h4 className="font-medium text-blue-800">توسعه ویژگی‌های جدید</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      با توجه به تغییر الگوی کاربران، ابزارهای تحلیل متن پیشرفته‌تر توسعه دهید.
                    </p>
                  </div>
                  <div className="p-3 border-l-4 border-green-500 bg-green-50">
                    <h4 className="font-medium text-green-800">بهبود تجربه کاربری</h4>
                    <p className="text-sm text-green-700 mt-1">
                      طراحی رابط کاربری بهینه‌تر برای ویژگی‌های پرکاربرد.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>جدول زمانی پیشنهادی</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="font-medium">هفته 1-2</div>
                    <div className="md:col-span-3">ارتقای سرور و بهینه‌سازی کش</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="font-medium">هفته 3-4</div>
                    <div className="md:col-span-3">توسعه ابزارهای تحلیل متن پیشرفته</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="font-medium">ماه 2</div>
                    <div className="md:col-span-3">بهبود رابط کاربری و تجربه کاربری</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div className="font-medium">ماه 3</div>
                    <div className="md:col-span-3">پیاده‌سازی سیستم پیش‌بینی خودکار</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
