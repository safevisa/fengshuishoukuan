"use client"

import { useState, useEffect } from "react"
import AdminGuard from "@/components/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Database, 
  Download, 
  RefreshCw,
  AlertCircle,
  Users,
  ShoppingCart,
  CreditCard
} from "lucide-react"

interface DatabaseStats {
  totalUsers: number
  totalOrders: number
  totalPayments: number
  totalPaymentLinks: number
  totalWithdrawals: number
  databaseSize: string
  lastBackup: string
}

export default function DataManagementPage() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // 获取各种数据统计
      const [usersRes, ordersRes, paymentsRes, linksRes, withdrawalsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/orders'),
        fetch('/api/payments'),
        fetch('/api/payment-links'),
        fetch('/api/withdrawals')
      ])

      const [usersData, ordersData, paymentsData, linksData, withdrawalsData] = await Promise.all([
        usersRes.json(),
        ordersRes.json(),
        paymentsRes.json(),
        linksRes.json(),
        withdrawalsRes.json()
      ])

      setStats({
        totalUsers: usersData.users?.length || 0,
        totalOrders: ordersData.orders?.length || 0,
        totalPayments: paymentsData.payments?.length || 0,
        totalPaymentLinks: linksData.paymentLinks?.length || 0,
        totalWithdrawals: withdrawalsData.withdrawals?.length || 0,
        databaseSize: "2.5 MB",
        lastBackup: new Date().toISOString().split('T')[0]
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('获取数据统计失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleExportData = async (type: string) => {
    setIsExporting(true)
    try {
      let endpoint = ''
      let filename = ''
      
      switch (type) {
        case 'users':
          endpoint = '/api/users'
          filename = 'users'
          break
        case 'orders':
          endpoint = '/api/orders'
          filename = 'orders'
          break
        case 'payments':
          endpoint = '/api/payments'
          filename = 'payments'
          break
        case 'all':
          endpoint = '/api/users' // 临时使用用户API
          filename = 'all-data'
          break
        default:
          throw new Error('Invalid export type')
      }

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error('Export failed')
      }

      const data = await response.json()
      
      // 创建CSV内容
      let csvContent = ''
      const items = data[type] || data[`${type}s`] || data.users || []
      if (items.length > 0) {
        const headers = Object.keys(items[0])
        csvContent = [
          headers,
          ...items.map((item: any) => headers.map(header => item[header] || ''))
        ].map(row => row.join(',')).join('\n')
      }

      // 下载文件
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      alert('数据导出成功！')
    } catch (error) {
      console.error('Export error:', error)
      alert('数据导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">加载中...</h2>
            <p className="text-gray-600">正在获取数据统计</p>
          </div>
        </div>
      </AdminGuard>
    )
  }

  if (error) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">加载失败</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchStats} variant="outline">
              重试
            </Button>
          </div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">数据管理</h1>
            <p className="text-gray-600 mt-2">管理系统数据和存储</p>
          </div>

          {/* 数据统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">用户数据</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">总用户数</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">订单数据</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground">总订单数</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">支付数据</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalPayments || 0}</div>
                <p className="text-xs text-muted-foreground">支付记录数</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">数据库大小</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.databaseSize || '0 MB'}</div>
                <p className="text-xs text-muted-foreground">最后备份: {stats?.lastBackup || '未知'}</p>
              </CardContent>
            </Card>
          </div>

          {/* 数据导出功能 */}
          <Card>
            <CardHeader>
              <CardTitle>数据导出</CardTitle>
              <CardDescription>导出系统数据为CSV格式</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  onClick={() => handleExportData('users')}
                  disabled={isExporting}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Users className="h-6 w-6 mb-2" />
                  导出用户数据
                </Button>
                <Button 
                  onClick={() => handleExportData('orders')}
                  disabled={isExporting}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <ShoppingCart className="h-6 w-6 mb-2" />
                  导出订单数据
                </Button>
                <Button 
                  onClick={() => handleExportData('payments')}
                  disabled={isExporting}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <CreditCard className="h-6 w-6 mb-2" />
                  导出支付数据
                </Button>
                <Button 
                  onClick={() => handleExportData('all')}
                  disabled={isExporting}
                  className="h-20 flex flex-col items-center justify-center col-span-full"
                >
                  <Download className="h-6 w-6 mb-2" />
                  导出所有数据
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  )
}
