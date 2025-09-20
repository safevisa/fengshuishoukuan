"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { jkopayService } from "@/lib/jkopay-api"
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react"

export default function APITestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [apiConfig, setApiConfig] = useState({
    apiUrl: process.env.NEXT_PUBLIC_JKOPAY_API_URL || 'https://gateway.suntone.com/payment/api/gotoPayment',
    merchantId: process.env.NEXT_PUBLIC_JKOPAY_MERCHANT_ID || '1888',
    terminalId: process.env.NEXT_PUBLIC_JKOPAY_TERMINAL_ID || '888506',
    secretKey: process.env.NEXT_PUBLIC_JKOPAY_SECRET_KEY || 'fe5b2c5ea084426bb1f6269acbac902f'
  })

  const addTestResult = (test: string, success: boolean, data: any, error?: string) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      success,
      data,
      error,
      timestamp: new Date().toLocaleString()
    }])
  }

  const testAPIConnection = async () => {
    setIsLoading(true)
    try {
      console.log('🧪 开始测试街口支付API连接...')
      const result = await jkopayService.testConnection()
      addTestResult('API连接测试', result.success, result, result.success ? undefined : result.message)
    } catch (error) {
      addTestResult('API连接测试', false, null, error instanceof Error ? error.message : '未知错误')
    } finally {
      setIsLoading(false)
    }
  }

  const testCreatePayment = async () => {
    setIsLoading(true)
    try {
      console.log('💳 开始测试创建支付订单...')
      const paymentRequest = {
        orderId: `test_${Date.now()}`,
        amount: 10000, // 100台币
        description: '测试支付订单',
        customerInfo: {
          name: '测试用户',
          email: 'test@example.com',
          phone: '+886912345678'
        }
      }
      
      const result = await jkopayService.createPayment(paymentRequest)
      addTestResult('创建支付订单', result.success, result, result.success ? undefined : result.error)
    } catch (error) {
      addTestResult('创建支付订单', false, null, error instanceof Error ? error.message : '未知错误')
    } finally {
      setIsLoading(false)
    }
  }

  const testQueryPayment = async () => {
    setIsLoading(true)
    try {
      console.log('🔍 开始测试查询支付状态...')
      const transactionId = `test_transaction_${Date.now()}`
      const result = await jkopayService.queryPaymentStatus(transactionId)
      addTestResult('查询支付状态', result !== null, result, result === null ? '查询失败' : undefined)
    } catch (error) {
      addTestResult('查询支付状态', false, null, error instanceof Error ? error.message : '未知错误')
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">街口支付API测试</h1>
          <p className="text-gray-600 mt-2">测试和调试街口支付API集成</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API配置 */}
          <Card>
            <CardHeader>
              <CardTitle>API配置</CardTitle>
              <CardDescription>配置街口支付API参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiUrl">API地址</Label>
                <Input
                  id="apiUrl"
                  value={apiConfig.apiUrl}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
                  placeholder="https://api.jkopay.com"
                />
              </div>
              <div>
                <Label htmlFor="merchantId">商户号</Label>
                <Input
                  id="merchantId"
                  value={apiConfig.merchantId}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, merchantId: e.target.value }))}
                  placeholder="1888"
                />
              </div>
              <div>
                <Label htmlFor="terminalId">终端号</Label>
                <Input
                  id="terminalId"
                  value={apiConfig.terminalId}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, terminalId: e.target.value }))}
                  placeholder="888506"
                />
              </div>
              <div>
                <Label htmlFor="secretKey">签名密钥</Label>
                <Input
                  id="secretKey"
                  type="password"
                  value={apiConfig.secretKey}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                  placeholder="您的签名密钥"
                />
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>测试环境：</strong> 已配置街口支付测试账号
                  <br />• 商户号: 1888
                  <br />• 终端号: 888506
                  <br />• API地址: https://gateway.suntone.com/payment/api/gotoPayment
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 测试操作 */}
          <Card>
            <CardHeader>
              <CardTitle>API测试</CardTitle>
              <CardDescription>执行各种API测试操作</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={testAPIConnection} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  测试API连接
                </Button>
                
                <Button 
                  onClick={testCreatePayment} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  测试创建支付订单
                </Button>
                
                <Button 
                  onClick={testQueryPayment} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  测试查询支付状态
                </Button>
                
                <Button 
                  onClick={clearResults} 
                  variant="destructive"
                  className="w-full"
                >
                  清空测试结果
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>测试结果</CardTitle>
              <CardDescription>查看API测试的执行结果</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <span className="font-medium">{result.test}</span>
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "成功" : "失败"}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">{result.timestamp}</span>
                    </div>
                    
                    {result.error && (
                      <div className="bg-red-50 p-3 rounded mb-2">
                        <p className="text-sm text-red-800">
                          <strong>错误：</strong> {result.error}
                        </p>
                      </div>
                    )}
                    
                    {result.data && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm font-medium mb-2">响应数据：</p>
                        <pre className="text-xs text-gray-700 overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* API文档链接 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API文档</CardTitle>
            <CardDescription>街口支付API相关文档和资源</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                请提供街口支付的API文档地址，以便我们进行正确的集成。
              </p>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  等待API文档地址...
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
