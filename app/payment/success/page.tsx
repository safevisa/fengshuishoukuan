"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId')
    setOrderId(orderIdParam)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            支付成功！
          </CardTitle>
          <CardDescription className="text-green-600">
            您的付款已成功处理
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                订单号: <span className="font-mono">{orderId}</span>
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              感谢您的购买！我们会尽快处理您的订单。
            </p>
            <p className="text-sm text-gray-600">
              如有任何问题，请联系我们的客服团队。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button asChild className="flex-1">
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                查看订单
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                返回首页
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
