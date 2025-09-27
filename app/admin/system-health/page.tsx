"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Database,
  Users,
  CreditCard,
  DollarSign,
  Link,
  TrendingUp,
  Activity
} from 'lucide-react'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function SystemHealthPage() {
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<any>(null)
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [ccTransactionResult, setCcTransactionResult] = useState<any>(null)
  const [error, setError] = useState('')

  const checkApiStatus = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin/check-data-apis')
      const data = await response.json()
      
      if (data.success) {
        setApiStatus(data.data)
      } else {
        setError(data.message || 'API检查失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const checkSyncStatus = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin/check-data-sync')
      const data = await response.json()
      
      if (data.success) {
        setSyncStatus(data.data)
      } else {
        setError(data.message || '数据同步检查失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const addCcTransaction = async () => {
    setLoading(true)
    setError('')
    setCcTransactionResult(null)
    
    try {
      const response = await fetch('/api/admin/add-cc-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCcTransactionResult(data.data)
        // 自动刷新API状态
        setTimeout(() => {
          checkApiStatus()
          checkSyncStatus()
        }, 1000)
      } else {
        setError(data.message || '添加CC交易失败')
      }
    } catch (err) {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    checkApiStatus()
    checkSyncStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-800">系统健康检查</h1>
          <div className="flex space-x-2">
            <Button onClick={checkApiStatus} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  检查中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  检查API
                </>
              )}
            </Button>
            <Button onClick={checkSyncStatus} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  检查中...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  检查同步
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 添加CC交易 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-amber-800 flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              添加CC用户交易
            </CardTitle>
            <CardDescription>添加用户cc的102元成功交易到服务器数据库</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={addCcTransaction} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    添加中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    添加CC交易
                  </>
                )}
              </Button>
              
              {ccTransactionResult && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    交易已添加！金额: ¥{ccTransactionResult.payment?.amount || 0}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API状态检查 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                API状态检查
                {apiStatus && (
                  <Badge className={`ml-2 ${getStatusColor(apiStatus.overallStatus)}`}>
                    {apiStatus.overallStatus}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>检查所有数据API的调用状态</CardDescription>
            </CardHeader>
            <CardContent>
              {apiStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{apiStatus.summary.success}</div>
                      <div className="text-sm text-blue-800">成功</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{apiStatus.summary.errors}</div>
                      <div className="text-sm text-red-800">错误</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">成功率: {apiStatus.summary.successRate}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    {Object.entries(apiStatus.apiChecks).map(([key, check]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(check.status)}
                          <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {check.count !== undefined ? check.count : (check.data ? '✓' : '✗')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">点击"检查API"开始检查</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 数据同步检查 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                数据同步检查
                {syncStatus && (
                  <Badge className={`ml-2 ${getStatusColor(syncStatus.overallSyncStatus)}`}>
                    {syncStatus.overallSyncStatus}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>检查用户端和管理端数据同步状态</CardDescription>
            </CardHeader>
            <CardContent>
              {syncStatus ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{syncStatus.summary.dataCounts.users}</div>
                      <div className="text-xs text-blue-800">用户</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{syncStatus.summary.dataCounts.orders}</div>
                      <div className="text-xs text-green-800">订单</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="text-lg font-bold text-yellow-600">{syncStatus.summary.dataCounts.payments}</div>
                      <div className="text-xs text-yellow-800">支付</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">
                      问题: {syncStatus.summary.totalIssues} | 
                      严重: {syncStatus.summary.criticalIssues} | 
                      警告: {syncStatus.summary.warningIssues}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    {Object.entries(syncStatus.syncChecks).map(([key, check]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(check.status)}
                          <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {check.issues.length} 问题
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {syncStatus.recommendations && syncStatus.recommendations.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">建议:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {syncStatus.recommendations.map((rec: string, index: number) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">点击"检查同步"开始检查</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

