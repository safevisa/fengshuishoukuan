#!/bin/bash

echo "🔧 修复路由冲突问题..."

# 进入应用目录
cd /opt/fengshui-ecommerce/fengshui-ecommerce

# 停止应用
echo "⏹️ 停止应用..."
systemctl stop fengshui-app

# 检查并删除冲突的路由文件
echo "🗑️ 清理冲突的路由文件..."

# 删除可能存在的旧路由文件
rm -rf app/pay/\[id\]
rm -rf app/pay/\[linkId\]
rm -rf app/payment/\[id\]
rm -rf app/payment/\[linkId\]

# 重新创建正确的pay目录结构
echo "📁 重新创建pay目录..."
mkdir -p app/pay/\[linkId\]

# 重新创建pay页面
cat > app/pay/\[linkId\]/page.tsx << 'EOF'
"use client"

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PaymentLinkPage() {
  const params = useParams()
  const linkId = params.linkId as string
  const [linkData, setLinkData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paymentData, setPaymentData] = useState({
    amount: '',
    description: '',
    customerEmail: '',
    customerPhone: ''
  })
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    if (linkId) {
      loadPaymentLink()
    }
  }, [linkId])

  const loadPaymentLink = async () => {
    try {
      setLoading(true)
      // 从API获取收款链接信息
      const response = await fetch(`/api/payment-links/${linkId}`)
      if (response.ok) {
        const data = await response.json()
        setLinkData(data)
        setPaymentData({
          amount: data.amount?.toString() || '',
          description: data.description || '',
          customerEmail: '',
          customerPhone: ''
        })
      } else {
        setError('收款链接不存在或已失效')
      }
    } catch (err) {
      console.error('Load payment link error:', err)
      setError('加载收款链接失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!paymentData.customerEmail || !paymentData.customerPhone) {
      setError('请填写邮箱和电话')
      return
    }

    try {
      setPaymentLoading(true)
      setError('')
      
      // 调用支付API
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkId: linkId,
          amount: parseFloat(paymentData.amount),
          description: paymentData.description,
          customerEmail: paymentData.customerEmail,
          customerPhone: paymentData.customerPhone
        })
      })

      const result = await response.json()
      
      if (result.success && result.paymentUrl) {
        // 跳转到支付页面
        window.location.href = result.paymentUrl
      } else {
        setError(result.message || '支付创建失败')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError('支付失败，请重试')
    } finally {
      setPaymentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-amber-700">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !linkData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold text-red-800">
              链接不存在
            </CardTitle>
            <CardDescription className="text-red-600">
              该收款链接不存在或已失效
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CreditCard className="h-16 w-16 text-amber-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-amber-800">
            收款链接
          </CardTitle>
          <CardDescription className="text-amber-600">
            请填写支付信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-700 font-medium">
              金额: ¥{linkData.amount}
            </p>
            <p className="text-sm text-amber-700">
              描述: {linkData.description}
            </p>
            <p className="text-xs text-amber-600 mt-2">
              链接ID: {linkId}
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">邮箱 *</Label>
              <Input
                id="email"
                type="email"
                value={paymentData.customerEmail}
                onChange={(e) => setPaymentData({...paymentData, customerEmail: e.target.value})}
                placeholder="请输入您的邮箱"
                className="mobile-input"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">电话 *</Label>
              <Input
                id="phone"
                type="tel"
                value={paymentData.customerPhone}
                onChange={(e) => setPaymentData({...paymentData, customerPhone: e.target.value})}
                placeholder="请输入您的电话"
                className="mobile-input"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            onClick={handlePayment} 
            disabled={paymentLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white mobile-button"
          >
            {paymentLoading ? (
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

          <div className="text-center">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
EOF

# 重新构建应用
echo "🏗️ 重新构建应用..."
pnpm run build

# 启动应用
echo "🚀 启动应用..."
systemctl start fengshui-app

# 检查状态
echo "📊 检查应用状态..."
systemctl status fengshui-app --no-pager

echo "✅ 路由冲突修复完成！"
