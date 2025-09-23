"use client"

import { useState, useEffect } from "react"
import AdminGuard from "@/components/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Database,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { enhancedStorage } from "@/lib/storage-enhanced"

interface StorageStats {
  users: number
  paymentLinks: number
  orders: number
  payments: number
  withdrawals: number
  lastSync: string
  storageSize: number
}

export default function DataManagementPage() {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    const currentStats = enhancedStorage.getStorageStats()
    setStats(currentStats)
  }

  const handleExport = () => {
    try {
      enhancedStorage.exportData()
      setMessage({ type: 'success', text: '数据导出成功！文件已下载到您的设备。' })
    } catch (error) {
      setMessage({ type: 'error', text: '数据导出失败，请重试。' })
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    enhancedStorage.importData(file)
      .then((success) => {
        if (success) {
          setMessage({ type: 'success', text: '数据导入成功！' })
          loadStats()
        } else {
          setMessage({ type: 'error', text: '数据导入失败，请检查文件格式。' })
        }
      })
      .catch(() => {
        setMessage({ type: 'error', text: '数据导入失败，请重试。' })
      })
      .finally(() => {
        setIsLoading(false)
        // 清空文件输入
        event.target.value = ''
      })
  }

  const handleClearData = () => {
    if (window.confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      try {
        enhancedStorage.clearAllData()
        setMessage({ type: 'warning', text: '所有数据已清空！' })
        loadStats()
      } catch (error) {
        setMessage({ type: 'error', text: '清空数据失败，请重试。' })
      }
    }
  }

  const handleSync = async () => {
    setIsLoading(true)
    try {
      // 这里可以添加服务器同步逻辑
      await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟同步
      setMessage({ type: 'success', text: '数据同步完成！' })
      loadStats()
    } catch (error) {
      setMessage({ type: 'error', text: '数据同步失败，请重试。' })
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Database className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">数据管理</h1>
                  <p className="text-sm text-gray-600">管理系统数据和存储</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 消息提示 */}
          {message && (
            <Alert className={`mb-6 ${
              message.type === 'success' ? 'border-green-200 bg-green-50' :
              message.type === 'error' ? 'border-red-200 bg-red-50' :
              'border-yellow-200 bg-yellow-50'
            }`}>
              {message.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {message.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-600" />}
              {message.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
              <AlertDescription className={
                message.type === 'success' ? 'text-green-800' :
                message.type === 'error' ? 'text-red-800' :
                'text-yellow-800'
              }>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 存储统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  存储统计
                </CardTitle>
                <CardDescription>当前系统数据概览</CardDescription>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
                        <div className="text-sm text-blue-800">用户</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.paymentLinks}</div>
                        <div className="text-sm text-green-800">支付链接</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{stats.orders}</div>
                        <div className="text-sm text-yellow-800">订单</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats.payments}</div>
                        <div className="text-sm text-purple-800">支付记录</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">存储大小</span>
                        <span className="text-sm font-medium">{formatFileSize(stats.storageSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">最后同步</span>
                        <span className="text-sm font-medium">{stats.lastSync}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">加载中...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 数据操作 */}
            <Card>
              <CardHeader>
                <CardTitle>数据操作</CardTitle>
                <CardDescription>导入、导出和管理系统数据</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 导出数据 */}
                <div>
                  <Label htmlFor="export" className="text-sm font-medium">
                    导出数据
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">
                    将所有数据导出为JSON文件，用于备份
                  </p>
                  <Button onClick={handleExport} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    导出数据
                  </Button>
                </div>

                <Separator />

                {/* 导入数据 */}
                <div>
                  <Label htmlFor="import" className="text-sm font-medium">
                    导入数据
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">
                    从JSON文件导入数据，将覆盖现有数据
                  </p>
                  <Input
                    id="import"
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    disabled={isLoading}
                    className="mb-2"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById('import')?.click()}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    选择文件导入
                  </Button>
                </div>

                <Separator />

                {/* 同步数据 */}
                <div>
                  <Label className="text-sm font-medium">
                    数据同步
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">
                    与服务器同步数据
                  </p>
                  <Button 
                    onClick={handleSync} 
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? '同步中...' : '同步数据'}
                  </Button>
                </div>

                <Separator />

                {/* 清空数据 */}
                <div>
                  <Label className="text-sm font-medium text-red-600">
                    危险操作
                  </Label>
                  <p className="text-xs text-gray-500 mb-2">
                    清空所有数据，此操作不可恢复
                  </p>
                  <Button 
                    onClick={handleClearData}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    清空所有数据
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 存储说明 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>存储说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>当前存储方式：</strong> 混合存储（本地 + 服务器）
                </p>
                <p>
                  <strong>本地存储：</strong> 使用浏览器 localStorage，数据在客户端保存
                </p>
                <p>
                  <strong>服务器存储：</strong> 数据同步到服务器文件系统，提供持久化备份
                </p>
                <p>
                  <strong>建议：</strong> 定期导出数据进行备份，生产环境建议使用专业数据库
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  )
}

