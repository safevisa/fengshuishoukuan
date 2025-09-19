"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Payment } from "@/lib/types"
import { db } from "@/lib/database"

export default function PaymentReturnPage() {
  const searchParams = useSearchParams()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<'success' | 'failed' | 'pending'>('pending')

  useEffect(() => {
    const paymentId = searchParams.get('payment_id')
    if (paymentId) {
      const paymentData = db.getPaymentById(paymentId)
      if (paymentData) {
        setPayment(paymentData)
        setStatus(paymentData.status === 'success' ? 'success' : paymentData.status === 'failed' ? 'failed' : 'pending')
      }
    }
    setIsLoading(false)
  }, [searchParams])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'TWD'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold mb-2">處理中...</h2>
              <p className="text-gray-600">正在驗證支付結果</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">支付記錄不存在</h2>
              <p className="text-gray-600 mb-4">無法找到對應的支付記錄</p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首頁
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              <span className="text-lg font-semibold">京世盈風水</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="text-center">
            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-green-600">支付成功</CardTitle>
                <CardDescription className="text-lg">
                  您的支付已成功處理，感謝您的購買！
                </CardDescription>
              </>
            )}
            {status === 'failed' && (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-red-600">支付失敗</CardTitle>
                <CardDescription className="text-lg">
                  支付處理失敗，請重試或聯繫客服
                </CardDescription>
              </>
            )}
            {status === 'pending' && (
              <>
                <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <CardTitle className="text-2xl text-blue-600">支付處理中</CardTitle>
                <CardDescription className="text-lg">
                  您的支付正在處理中，請稍候...
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">支付詳情</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">支付ID</span>
                    <span className="font-mono">{payment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">訂單ID</span>
                    <span className="font-mono">{payment.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">支付金額</span>
                    <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">支付方式</span>
                    <span>街口支付</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">支付狀態</span>
                    <Badge variant={status === 'success' ? 'default' : status === 'failed' ? 'destructive' : 'secondary'}>
                      {status === 'success' ? '成功' : status === 'failed' ? '失敗' : '處理中'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">支付時間</span>
                    <span>{new Date(payment.createdAt).toLocaleString('zh-TW')}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Link href="/" className="flex-1">
                  <Button className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    返回首頁
                  </Button>
                </Link>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    查看工作台
                  </Button>
                </Link>
              </div>

              {status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">支付失敗原因</h4>
                  <p className="text-red-700 text-sm">
                    可能的原因包括：餘額不足、卡片過期、網絡問題等。請檢查您的支付信息後重試。
                  </p>
                </div>
              )}

              {status === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">支付處理中</h4>
                  <p className="text-blue-700 text-sm">
                    您的支付正在處理中，通常需要幾分鐘時間。請耐心等待，我們會通過郵件通知您結果。
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
