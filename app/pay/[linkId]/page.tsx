"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, User, Mail, Phone, DollarSign } from 'lucide-react'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function PaymentPage() {
  const params = useParams()
  const linkId = params.linkId as string
  
  const [paymentLink, setPaymentLink] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [redirecting, setRedirecting] = useState(false)
  
  // 客户信息
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  
  useEffect(() => {
    if (linkId) {
      fetchPaymentLink()
    }
  }, [linkId])
  
  const fetchPaymentLink = async () => {
    try {
      const response = await fetch(`/api/payment-links/${linkId}`)
      const data = await response.json()
      
      if (data.success) {
        setPaymentLink(data.data)
      } else {
        setError(data.message || '获取支付链接失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }
  
  const handlePayment = async () => {
    if (!customerName || !customerEmail || !customerPhone) {
      setError('请填写完整的客户信息')
      return
    }
    
    setProcessing(true)
    setError('')
    
    try {
      const response = await fetch('/api/jkopay/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkId,
          customerName,
          customerEmail,
          customerPhone
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.data.paymentUrl) {
        setRedirecting(true)
        // 重定向到支付页面
        window.location.href = data.data.paymentUrl
      } else {
        setError(data.message || '支付创建失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setProcessing(false)
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-gray-600">加载支付信息中...</p>
        </div>
      </div>
    )
  }
  
  if (error && !paymentLink) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">支付失败</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-amber-600">正在跳转支付...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
            <p className="text-gray-600">请稍候，正在跳转到支付页面</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-amber-800 text-center">
              支付页面
            </CardTitle>
            <CardDescription className="text-center">
              请填写信息并完成支付
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 支付信息 */}
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">支付金额</span>
                <span className="text-2xl font-bold text-amber-800">
                  ¥{paymentLink?.amount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">商品描述</span>
                <span className="text-sm font-medium">{paymentLink?.description || ''}</span>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* 客户信息表单 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  客户姓名
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="请输入客户姓名"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="customerEmail" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  邮箱地址
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="请输入邮箱地址"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="customerPhone" className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  手机号码
                </Label>
                <Input
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="请输入手机号码"
                  required
                />
              </div>
            </div>
            
            {/* 支付按钮 */}
            <Button
              onClick={handlePayment}
              disabled={processing || !customerName || !customerEmail || !customerPhone}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  立即支付 ¥{paymentLink?.amount || 0}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}