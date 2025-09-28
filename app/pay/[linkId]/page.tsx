'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function PaymentPage() {
  const params = useParams()
  const linkId = params.linkId as string
  
  const [paymentLink, setPaymentLink] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    if (linkId) {
      fetchPaymentLink()
    }
  }, [linkId])

  // 页面加载后自动跳转到街口支付
  useEffect(() => {
    if (paymentLink && !redirecting && !error) {
      redirectToJkopay()
    }
  }, [paymentLink, redirecting, error])
  
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
  
  // 自动跳转到街口支付
  const redirectToJkopay = async () => {
    setRedirecting(true)
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
          customerName: 'Customer', // 使用默认值
          customerEmail: 'customer@example.com',
          customerPhone: '0912345678'
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.data.paymentUrl) {
        // 直接跳转到街口支付页面
        window.location.href = data.data.paymentUrl
      } else {
        setError(data.message || '支付创建失败')
        setRedirecting(false)
      }
    } catch (err) {
      setError('网络错误，请重试')
      setRedirecting(false)
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
          <p className="text-gray-600">正在跳转到街口支付收银台...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
        <p className="text-gray-600">正在跳转到街口支付收银台...</p>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 max-w-md mx-auto">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}