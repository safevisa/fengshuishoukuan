"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { PaymentLink, PaymentMethod } from "@/lib/types"
import { db } from "@/lib/database"
import { paymentService } from "@/lib/payment"

export default function PaymentPage() {
  const params = useParams()
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
  const [error, setError] = useState("")

  useEffect(() => {
    if (params.id) {
      const link = db.getPaymentLinkById(params.id as string)
      if (link) {
        setPaymentLink(link)
      }
      setPaymentMethods(paymentService.getPaymentMethods())
    }
  }, [params.id])

  const handlePayment = async () => {
    if (!paymentLink || !selectedMethod) return

    setIsLoading(true)
    setError("")
    setPaymentStatus('processing')

    try {
      // 创建订单
      const order = db.createOrder({
        userId: paymentLink.userId,
        items: [{
          id: `item-${Date.now()}`,
          productId: 'payment-link',
          productName: paymentLink.title,
          price: paymentLink.amount,
          quantity: 1,
          total: paymentLink.amount
        }],
        totalAmount: paymentLink.amount,
        paymentMethod: selectedMethod,
        status: 'pending',
        shippingAddress: {
          name: '',
          phone: '',
          address: '',
          city: '',
          province: '',
          postalCode: '',
          country: ''
        }
      })

      // 创建支付
      const result = await paymentService.createPayment(order, selectedMethod)
      
      if (result.success && result.paymentUrl) {
        // 重定向到支付页面
        window.location.href = result.paymentUrl
      } else {
        setError(result.error || '支付创建失败')
        setPaymentStatus('failed')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '支付处理失败')
      setPaymentStatus('failed')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  if (!paymentLink) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">链接不存在</h2>
              <p className="text-gray-600 mb-4">该收款链接不存在或已失效</p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首页
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">支付成功</h2>
              <p className="text-gray-600 mb-4">您的支付已成功处理</p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  返回首页
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
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">安全支付</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 支付信息卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{paymentLink.title}</CardTitle>
              {paymentLink.description && (
                <CardDescription className="text-base">{paymentLink.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">支付金额</span>
                  <span className="text-3xl font-bold text-green-600">
                    {formatCurrency(paymentLink.amount)}
                  </span>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">货币</span>
                    <span>{paymentLink.currency}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">创建时间</span>
                    <span>{formatDate(paymentLink.createdAt)}</span>
                  </div>
                  {paymentLink.expiresAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">过期时间</span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(paymentLink.expiresAt)}
                      </span>
                    </div>
                  )}
                  {paymentLink.maxUses && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">使用次数</span>
                      <span>{paymentLink.usedCount} / {paymentLink.maxUses}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 支付方式选择 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                选择支付方式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="payment-method">支付方式</Label>
                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择支付方式" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          <div className="flex items-center space-x-2">
                            <span>{method.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {method.feeRate * 100}% 手续费
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-red-700 text-sm">{error}</span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handlePayment} 
                  disabled={!selectedMethod || isLoading || paymentStatus === 'processing'}
                  className="w-full"
                  size="lg"
                >
                  {isLoading || paymentStatus === 'processing' ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      立即支付 {formatCurrency(paymentLink.amount)}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 安全提示 */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-800">安全支付保障</h3>
                  <p className="text-sm text-green-700 mt-1">
                    我们使用银行级别的加密技术保护您的支付信息，确保交易安全。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
