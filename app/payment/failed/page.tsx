"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId')
    setOrderId(orderIdParam)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            支付失败
          </CardTitle>
          <CardDescription className="text-red-600">
            您的付款未能成功处理
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && (
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">
                订单号: <span className="font-mono">{orderId}</span>
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              支付过程中出现问题，请检查您的支付信息或重试。
            </p>
            <p className="text-sm text-gray-600">
              如果问题持续存在，请联系我们的客服团队。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button asChild className="flex-1">
              <Link href="/checkout">
                <RefreshCw className="h-4 w-4 mr-2" />
                重新支付
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
