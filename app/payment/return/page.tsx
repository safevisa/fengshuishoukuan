"use client"

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Clock, DollarSign, Calendar } from 'lucide-react'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function PaymentReturnPage() {
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending' | null>(null)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // 从URL参数获取支付结果
    const orderNo = searchParams.get('orderNo')
    const respCode = searchParams.get('respCode')
    const respMsg = searchParams.get('respMsg')
    const amount = searchParams.get('amount')
    const tradeNo = searchParams.get('tradeNo')
    
    if (orderNo) {
      setPaymentData({
        orderNo,
        respCode,
        respMsg,
        amount,
        tradeNo
      })
      
      // 根据响应码判断支付状态
      if (respCode === '00' || respCode === '000' || respCode === '0000') {
        setPaymentStatus('success')
      } else if (respCode === '003' || respCode === '004') {
        setPaymentStatus('pending')
      } else {
        setPaymentStatus('failed')
      }
      
      // 触发支付回调通知
      triggerPaymentNotify({
        orderNo,
        respCode,
        respMsg,
        amount,
        tradeNo
      })
    }
    
    setLoading(false)
  }, [searchParams])
  
  const triggerPaymentNotify = async (data: any) => {
    try {
      // 发送支付通知到后端
      await fetch('/api/payment/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data).toString()
      })
    } catch (error) {
      console.error('支付通知发送失败:', error)
    }
  }
  
  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
      case 'pending':
        return <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
      default:
        return <Clock className="h-16 w-16 text-gray-500 mx-auto mb-4" />
    }
  }
  
  const getStatusTitle = () => {
    switch (paymentStatus) {
      case 'success':
        return '支付成功'
      case 'failed':
        return '支付失败'
      case 'pending':
        return '支付处理中'
      default:
        return '支付状态未知'
    }
  }
  
  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'success':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'pending':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-gray-600">处理支付结果中...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className={`text-2xl font-bold text-center ${getStatusColor()}`}>
              {getStatusTitle()}
            </CardTitle>
            <CardDescription className="text-center">
              支付处理结果
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {getStatusIcon()}
            
            {paymentData && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">订单号</span>
                    <span className="text-sm font-mono">{paymentData.orderNo}</span>
                  </div>
                  
                  {paymentData.amount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">支付金额</span>
                      <span className="text-lg font-bold text-amber-800">
                        ¥{paymentData.amount}
                      </span>
                    </div>
                  )}
                  
                  {paymentData.tradeNo && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">交易号</span>
                      <span className="text-sm font-mono">{paymentData.tradeNo}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">响应码</span>
                    <span className="text-sm font-mono">{paymentData.respCode}</span>
                  </div>
                  
                  {paymentData.respMsg && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">响应信息</span>
                      <span className="text-sm">{paymentData.respMsg}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">处理时间</span>
                    <span className="text-sm">{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
            
            {paymentStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  恭喜！您的支付已成功完成。我们会尽快处理您的订单。
                </AlertDescription>
              </Alert>
            )}
            
            {paymentStatus === 'failed' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  支付失败，请检查您的支付信息或联系客服。
                </AlertDescription>
              </Alert>
            )}
            
            {paymentStatus === 'pending' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Clock className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  支付正在处理中，请稍候。我们会在处理完成后通知您。
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex space-x-4">
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="flex-1"
              >
                返回首页
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 bg-amber-600 hover:bg-amber-700"
              >
                查看订单
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

