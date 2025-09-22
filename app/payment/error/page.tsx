"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function PaymentErrorPage() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("支付处理出现错误")

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setErrorMessage(decodeURIComponent(message))
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-800">
            支付错误
          </CardTitle>
          <CardDescription className="text-yellow-600">
            支付处理过程中出现错误
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700">
              {errorMessage}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              请稍后重试或联系我们的客服团队获取帮助。
            </p>
            <p className="text-sm text-gray-600">
              客服电话: +852 61588111
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button asChild className="flex-1">
              <Link href="/checkout">
                <RefreshCw className="h-4 w-4 mr-2" />
                重试支付
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
