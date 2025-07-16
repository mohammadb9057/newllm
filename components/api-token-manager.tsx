'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Copy, RefreshCw, Eye, EyeOff, Key, Globe } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TokenData {
  token: string
  api_base: string
}

export function APITokenManager() {
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchToken()
  }, [])

  const fetchToken = async () => {
    try {
      const response = await fetch('/api/tokens')
      if (response.ok) {
        const data = await response.json()
        setTokenData(data)
      } else {
        toast({
          title: "خطا",
          description: "دریافت توکن با مشکل مواجه شد",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching token:', error)
      toast({
        title: "خطا",
        description: "خطا در ارتباط با سرور",
        variant: "destructive"
      })
    }
  }

  const generateNewToken = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        setTokenData(prev => prev ? { ...prev, token: data.token } : null)
        toast({
          title: "موفقیت",
          description: "توکن جدید با موفقیت تولید شد",
        })
      } else {
        toast({
          title: "خطا",
          description: "تولید توکن جدید با مشکل مواجه شد",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error generating token:', error)
      toast({
        title: "خطا",
        description: "خطا در ارتباط با سرور",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "کپی شد",
        description: `${label} در کلیپ‌بورد کپی شد`,
      })
    } catch (error) {
      toast({
        title: "خطا",
        description: "کپی کردن با مشکل مواجه شد",
        variant: "destructive"
      })
    }
  }

  const maskToken = (token: string) => {
    if (!token) return ''
    return `${token.substring(0, 8)}${'*'.repeat(token.length - 12)}${token.substring(token.length - 4)}`
  }

  if (!tokenData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            مدیریت توکن API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">در حال بارگذاری...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            مدیریت توکن API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-token">توکن API شما</Label>
            <div className="flex gap-2">
              <Input
                id="api-token"
                value={showToken ? tokenData.token : maskToken(tokenData.token)}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(tokenData.token, 'توکن API')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-base">آدرس پایه API</Label>
            <div className="flex gap-2">
              <Input
                id="api-base"
                value={tokenData.api_base}
                readOnly
                className="font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(tokenData.api_base, 'آدرس پایه API')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              onClick={generateNewToken}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'در حال تولید...' : 'تولید توکن جدید'}
            </Button>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              فعال
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>نحوه استفاده از API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>مثال درخواست cURL:</Label>
            <div className="bg-muted p-3 rounded-md mt-2 font-mono text-sm overflow-x-auto">
              <pre>{`curl -X POST "${tokenData.api_base}/chat" \\
  -H "Authorization: Bearer ${showToken ? tokenData.token : maskToken(tokenData.token)}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "سلام، چطوری؟",
    "model": "gpt-4"
  }'`}</pre>
            </div>
          </div>

          <div>
            <Label>مثال JavaScript:</Label>
            <div className="bg-muted p-3 rounded-md mt-2 font-mono text-sm overflow-x-auto">
              <pre>{`const response = await fetch('${tokenData.api_base}/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${showToken ? tokenData.token : maskToken(tokenData.token)}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'سلام، چطوری؟',
    model: 'gpt-4'
  })
});

const data = await response.json();
console.log(data);`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
