"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CreditCard, AlertCircle } from 'lucide-react'

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
      // 调用街口支付API
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
        // 重定向到街口支付页面
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
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-gray-600">正在跳转到支付页面...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="max-w-md mx-auto py-12 px-4">
        <Card className="border-amber-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-amber-100 rounded-full w-fit">
              <CreditCard className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-amber-800">街口支付</CardTitle>
            <p className="text-amber-600">请填写信息完成支付</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {paymentLink && (
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="font-semibold text-amber-800 mb-2">{paymentLink.description}</h3>
                <p className="text-2xl font-bold text-amber-600">¥{paymentLink.amount}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName" className="text-amber-700">姓名</Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="请输入您的姓名"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="border-amber-300 focus:border-amber-500"
                />
              </div>
              
              <div>
                <Label htmlFor="customerEmail" className="text-amber-700">邮箱</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="请输入您的邮箱"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="border-amber-300 focus:border-amber-500"
                />
              </div>
              
              <div>
                <Label htmlFor="customerPhone" className="text-amber-700">电话</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="请输入您的电话"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="border-amber-300 focus:border-amber-500"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <Button 
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  立即支付
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}