"use client"

import { useState, useEffect } from "react"
import UserGuard from "@/components/user-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  DollarSign, 
  ShoppingCart, 
  Link as LinkIcon,
  RefreshCw,
  AlertCircle,
  Plus,
  Share,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  CreditCard,
  Eye,
  Calendar,
  TrendingUp
} from "lucide-react"
import { PaymentLink, Order, Withdrawal } from "@/lib/types"

interface PaymentStats {
  totalStats: {
    totalUsers: number
    totalOrders: number
    totalPayments: number
    totalPaymentLinks: number
    totalAmount: number
    successPayments: number
    successAmount: number
    successRate: string
  }
  userStats: Array<{
    userId: string
    userName: string
    userEmail: string
    totalOrders: number
    totalPayments: number
    successPayments: number
    totalAmount: number
    successAmount: number
    paymentLinks: number
    successRate: string
  }>
}

export default function UserDashboard() {
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm, setCreateForm] = useState({
    amount: '',
    description: '',
    productImage: '',
    maxUses: 1,
    isSingleUse: true
  })
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    bankAccount: ''
  })
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false)
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      // 获取当前用户信息
      const userData = localStorage.getItem('user')
      if (!userData) {
        setError('请先登录')
        return
      }
      
      const user = JSON.parse(userData)

      // 获取支付统计
      const statsResponse = await fetch('/api/payment-stats')
      const statsData = await statsResponse.json()

      if (statsData.success) {
        setStats(statsData.data)
      } else {
        throw new Error(statsData.message || '获取统计数据失败')
      }

      // 获取当前用户的支付链接
      const linksResponse = await fetch(`/api/payment-links?userId=${user.id}`)
      const linksData = await linksResponse.json()
      if (linksData.success && linksData.paymentLinks) {
        const userLinks = linksData.paymentLinks.filter((link: any) => link.user_id === user.id || link.userId === user.id)
        setPaymentLinks(userLinks)
      }

      // 获取用户订单
      const ordersResponse = await fetch("/api/orders")
      const ordersData = await ordersResponse.json()
      if (ordersData.success && ordersData.orders) {
        const userOrders = ordersData.orders.filter((order: any) => order.user_id === user.id || order.userId === user.id)
        setOrders(userOrders)
      }

      // 获取用户提现记录
      const withdrawalsResponse = await fetch("/api/withdrawals")
      const withdrawalsData = await withdrawalsResponse.json()
      if (withdrawalsData.success && withdrawalsData.data) {
        const userWithdrawals = withdrawalsData.data.filter((withdrawal: any) => withdrawal.user_id === user.id || withdrawal.userId === user.id)
        setWithdrawals(userWithdrawals)
      }

    } catch (err) {
      console.error('❌ 获取数据失败:', err)
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCreateForm(prev => ({ ...prev, productImage: data.data.fileUrl }))
        setImagePreview(data.data.fileUrl)
        alert('图片上传成功！')
      } else {
        throw new Error(data.message || '上传失败')
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      alert('图片上传失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        alert('请选择 JPG、PNG 或 WebP 格式的图片')
        return
      }
      
      // 验证文件大小 (最大5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        alert('图片大小不能超过 5MB')
        return
      }
      
      handleImageUpload(file)
    }
  }

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.amount || !createForm.description) {
      alert('请填写金额和描述')
      return
    }

    setCreateLoading(true)
    try {
      // 获取当前用户信息
      const userData = localStorage.getItem('user')
      if (!userData) {
        alert('请先登录')
        return
      }
      const user = JSON.parse(userData)
      
      // 确保使用真实的用户ID
      if (!user.id) {
        alert('用户信息错误，请重新登录')
        return
      }


      const response = await fetch('/api/payment-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(createForm.amount),
          description: createForm.description,
          userId: user.id, // 使用真实的用户ID
          productImage: createForm.productImage,
          maxUses: createForm.maxUses,
          isSingleUse: createForm.isSingleUse
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('收款链接创建成功！')
        setCreateForm({ 
          amount: '', 
          description: '', 
          productImage: '', 
          maxUses: 1, 
          isSingleUse: true 
        })
        setImagePreview(null)
        fetchData() // 重新获取数据
      } else {
        alert(data.message || '创建失败')
      }
    } catch (err) {
      alert('创建失败，请重试')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!withdrawalForm.amount || !withdrawalForm.bankAccount) {
      alert('请填写金额和银行账户')
      return
    }

    const amount = parseFloat(withdrawalForm.amount)
    if (amount <= 0) {
      alert('提现金额必须大于0')
      return
    }

    // 检查余额是否足够
    const userData = localStorage.getItem('user')
    if (!userData) {
      alert('请先登录')
      return
    }
    const user = JSON.parse(userData)
    
    // 计算用户总收益
    const userOrders = orders.filter(order => order.status === 'completed')
    const totalEarnings = userOrders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0)
    
    if (amount > totalEarnings) {
      alert(`提现金额不能超过总收益 ¥${totalEarnings.toFixed(2)}`)
      return
    }

    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount: amount,
          bankAccount: withdrawalForm.bankAccount,
          status: 'pending'
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('提现申请提交成功！')
        setWithdrawalForm({ amount: '', bankAccount: '' })
        fetchData() // 重新获取数据
      } else {
        alert(data.message || '提现申请失败')
      }
    } catch (err) {
      alert('提现申请失败，请重试')
    }
  }

  const handleExportReport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/reconciliation/user', {
        method: 'GET',
      })

      if (response.ok) {
        const data = await response.json()
        
        // 创建CSV内容
        const csvContent = [
          ['日期', '订单数', '总金额', '成功订单', '成功金额', '成功率'],
          ...data.reconciliationReport.dailyStats.map((day: any) => [
            day.date,
            day.totalOrders,
            day.totalAmount,
            day.completedOrders,
            day.completedAmount,
            day.completedOrders > 0 ? ((day.completedOrders / day.totalOrders) * 100).toFixed(2) + '%' : '0%'
          ])
        ].map(row => row.join(',')).join('\n')

        // 下载文件
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `对账报表_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert('导出失败，请重试')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('确定要删除这个收款链接吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/payment-links/${linkId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('收款链接删除成功！')
        fetchData() // 重新获取数据
      } else {
        alert('删除失败')
      }
    } catch (err) {
      alert('删除失败，请重试')
    }
  }

  const handleShareLink = async (link: PaymentLink) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.description,
          text: `收款链接：${link.description}`,
          url: link.paymentUrl || `https://jinshiying.com/pay/${link.id}`
        })
      } catch (err) {
      }
    } else {
      // 备用分享方法 - 复制链接到剪贴板
      const shareUrl = link.paymentUrl || `https://jinshiying.com/pay/${link.id}`
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopiedLink(link.id)
        setTimeout(() => setCopiedLink(null), 2000)
        alert('链接已复制到剪贴板')
      } catch (err) {
        // 如果复制失败，使用备用方法
        const textArea = document.createElement('textarea')
        textArea.value = shareUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopiedLink(link.id)
        setTimeout(() => setCopiedLink(null), 2000)
        alert('链接已复制到剪贴板')
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: '已完成' },
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: '待处理' },
      'cancelled': { color: 'bg-red-100 text-red-800', icon: XCircle, text: '已取消' },
      'failed': { color: 'bg-red-100 text-red-800', icon: XCircle, text: '失败' },
      'Processing': { color: 'bg-blue-100 text-blue-800', icon: Clock, text: '处理中' },
      'Order Timeout': { color: 'bg-orange-100 text-orange-800', icon: Clock, text: '超时' },
      'Payment Failed': { color: 'bg-red-100 text-red-800', icon: XCircle, text: '支付失败' }
    }
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { color: 'bg-gray-100 text-gray-800', icon: Clock, text: status }
    const Icon = statusInfo.icon
    
    return (
      <Badge className={`${statusInfo.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {statusInfo.text}
      </Badge>
    )
  }

  const formatDate = (date: string | Date) => {
    if (!date) return '未知时间'
    try {
      const dateObj = date instanceof Date ? date : new Date(date)
      return dateObj.toLocaleString('zh-CN')
    } catch {
      return '未知时间'
    }
  }

  // 过滤订单
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.description && order.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.transactionId && order.transactionId.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // 计算用户统计数据
  const userStats = {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalAmount: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (Number(o.amount) || 0), 0),
    successRate: orders.length > 0 ? ((orders.filter(o => o.status === 'completed').length / orders.length * 100).toFixed(1)) + '%' : '0%'
  }

  useEffect(() => {
    fetchData()
    
    // 设置定时刷新，每30秒刷新一次数据
    const interval = setInterval(() => {
      fetchData()
    }, 30000) // 30秒
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold mb-2">加载中...</h2>
          <p className="text-gray-600">正在获取数据</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            重试
          </Button>
        </div>
      </div>
    )
  }

  return (
    <UserGuard requiredRole="dashboard_user">
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">用户工作台</h1>
                <p className="text-gray-600 mt-2">管理您的收款链接、订单和提现</p>
              </div>
              <Button 
                onClick={fetchData} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新数据
              </Button>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">我的订单</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  成功订单: {userStats.completedOrders}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">我的收益</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{userStats.totalAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  成功率: {userStats.successRate}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">收款链接</CardTitle>
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{paymentLinks.length}</div>
                <p className="text-xs text-muted-foreground">
                  活跃链接
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总用户</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalStats.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  平台用户
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">收款成功总金额</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{userStats.totalAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  成功订单: {userStats.completedOrders}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今日收款额</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{orders.filter(o => {
                  const today = new Date()
                  const orderDate = new Date(o.createdAt)
                  return orderDate.toDateString() === today.toDateString() && o.status === 'completed'
                }).reduce((sum, order) => sum + (Number(order.amount) || 0), 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  今日成功: {orders.filter(o => {
                    const today = new Date()
                    const orderDate = new Date(o.createdAt)
                    return orderDate.toDateString() === today.toDateString() && o.status === 'completed'
                  }).length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 主要内容区域 */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="orders">订单管理</TabsTrigger>
              <TabsTrigger value="links">收款链接</TabsTrigger>
              <TabsTrigger value="withdrawals">提现管理</TabsTrigger>
              <TabsTrigger value="reconciliation">对账报表</TabsTrigger>
            </TabsList>

            {/* 订单管理 */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>订单管理</CardTitle>
                      <CardDescription>查看和管理您的所有订单</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="搜索订单..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8 w-64"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="all">全部状态</option>
                        <option value="completed">已完成</option>
                        <option value="pending">待处理</option>
                        <option value="cancelled">已取消</option>
                        <option value="failed">失败</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">订单 #{order.id.slice(-8)}</span>
                                {getStatusBadge(order.status)}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">金额:</span> ¥{Number(order.amount).toFixed(2)}
                                </div>
                                <div>
                                  <span className="font-medium">创建时间:</span> {formatDate(order.createdAt)}
                                </div>
                                <div>
                                  <span className="font-medium">完成时间:</span> {order.completedAt ? formatDate(order.completedAt) : '未完成'}
                                </div>
                              </div>
                              {order.transactionId && (
                                <div className="mt-2 text-sm text-gray-500">
                                  <span className="font-medium">交易号:</span> {order.transactionId}
                                </div>
                              )}
                              {order.paymentLinkId && (
                                <div className="mt-2 text-sm text-blue-600">
                                  <span className="font-medium">关联收款链接:</span> {order.paymentLinkId.slice(-8)}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsOrderDetailsOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                查看详情
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">暂无订单</p>
                      <p className="text-sm text-gray-400 mt-1">创建收款链接后，订单将显示在这里</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 收款链接管理 */}
            <TabsContent value="links" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>收款链接</CardTitle>
                      <CardDescription>管理您的收款链接</CardDescription>
                    </div>
                    <Button onClick={() => document.getElementById('create-link-form')?.scrollIntoView()}>
                      <Plus className="h-4 w-4 mr-2" />
                      创建收款链接
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 创建新收款链接表单 */}
                  <div id="create-link-form" className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">创建新收款链接</h3>
                    <form onSubmit={handleCreateLink} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="amount">金额</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="请输入金额"
                            value={createForm.amount}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, amount: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">描述</Label>
                          <Input
                            id="description"
                            type="text"
                            placeholder="请输入描述"
                            value={createForm.description}
                            onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      {/* 产品图片上传 */}
                      <div>
                        <Label htmlFor="productImage">产品图片（可选）</Label>
                        <div className="mt-2">
                          <input
                            id="productImage"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('productImage')?.click()}
                              disabled={uploadingImage}
                            >
                              {uploadingImage ? '上传中...' : '选择图片'}
                            </Button>
                            {imagePreview && (
                              <div className="flex items-center gap-2">
                                <img 
                                  src={imagePreview} 
                                  alt="产品预览" 
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setImagePreview(null)
                                    setCreateForm(prev => ({ ...prev, productImage: '' }))
                                  }}
                                >
                                  删除
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            支持 JPG、PNG、WebP 格式，最大 5MB
                          </p>
                        </div>
                      </div>

                      {/* 使用次数设置 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="maxUses">最大使用次数</Label>
                          <Input
                            id="maxUses"
                            type="number"
                            min="1"
                            placeholder="1"
                            value={createForm.maxUses}
                            onChange={(e) => setCreateForm(prev => ({ 
                              ...prev, 
                              maxUses: parseInt(e.target.value) || 1,
                              isSingleUse: parseInt(e.target.value) === 1
                            }))}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            id="isSingleUse"
                            type="checkbox"
                            checked={createForm.isSingleUse}
                            onChange={(e) => setCreateForm(prev => ({ 
                              ...prev, 
                              isSingleUse: e.target.checked,
                              maxUses: e.target.checked ? 1 : prev.maxUses
                            }))}
                            className="rounded"
                          />
                          <Label htmlFor="isSingleUse" className="text-sm">
                            一次性使用（收款成功后链接失效）
                          </Label>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit" disabled={createLoading}>
                          {createLoading ? '创建中...' : '创建链接'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setCreateForm({ 
                              amount: '', 
                              description: '', 
                              productImage: '', 
                              maxUses: 1, 
                              isSingleUse: true 
                            })
                            setImagePreview(null)
                          }}
                        >
                          取消
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* 收款链接列表 */}
                  {paymentLinks.length > 0 ? (
                    <div className="space-y-4">
                      {paymentLinks.map((link) => (
                        <div key={link.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start gap-3">
                                {link.productImage && (
                                  <img 
                                    src={link.productImage} 
                                    alt="产品图片" 
                                    className="w-16 h-16 object-cover rounded border flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-medium">{link.description}</h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    金额: ¥{link.amount} | 创建时间: {formatDate(link.createdAt)}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                    <span>使用次数: {link.usedCount || 0}/{link.maxUses || 1}</span>
                                    <span className={`px-2 py-1 rounded ${
                                      link.isSingleUse ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                      {link.isSingleUse ? '一次性' : '多次使用'}
                                    </span>
                                    <span className={`px-2 py-1 rounded ${
                                      link.status === 'completed' ? 'bg-red-100 text-red-600' : 
                                      link.status === 'active' ? 'bg-green-100 text-green-600' : 
                                      'bg-gray-100 text-gray-600'
                                    }`}>
                                      {link.status === 'completed' ? '已使用' : 
                                       link.status === 'active' ? '可用' : link.status}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1 break-all">
                                    链接: {link.paymentUrl || '链接生成中...'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShareLink(link)}
                              >
                                <Share className="h-4 w-4 mr-1" />
                                {copiedLink === link.id ? '已复制' : '分享'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteLink(link.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <LinkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">暂无收款链接</p>
                      <p className="text-sm text-gray-400 mt-1">点击上方按钮创建您的第一个收款链接</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 提现管理 */}
            <TabsContent value="withdrawals" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>提现管理</CardTitle>
                      <CardDescription>申请提现和管理提现记录</CardDescription>
                    </div>
                    <Button onClick={() => setIsWithdrawalOpen(true)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      申请提现
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 提现表单 */}
                  <div id="withdrawal-form" className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">申请提现</h3>
                    <form onSubmit={handleWithdrawal} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="withdrawal-amount">提现金额</Label>
                          <Input
                            id="withdrawal-amount"
                            type="number"
                            placeholder="请输入提现金额"
                            value={withdrawalForm.amount}
                            onChange={(e) => setWithdrawalForm(prev => ({ ...prev, amount: e.target.value }))}
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            可提现金额: ¥{userStats.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="bank-account">银行账户</Label>
                          <Input
                            id="bank-account"
                            type="text"
                            placeholder="请输入银行账户信息"
                            value={withdrawalForm.bankAccount}
                            onChange={(e) => setWithdrawalForm(prev => ({ ...prev, bankAccount: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button type="submit">
                          提交提现申请
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setWithdrawalForm({ amount: '', bankAccount: '' })}
                        >
                          取消
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* 提现记录 */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">提现记录</h3>
                    {withdrawals.length > 0 ? (
                      <div className="space-y-4">
                        {withdrawals.map((withdrawal) => (
                          <div key={withdrawal.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-medium">提现申请 #{withdrawal.id.slice(-8)}</span>
                                  {getStatusBadge(withdrawal.status)}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">金额:</span> ¥{withdrawal.amount.toFixed(2)}
                                  </div>
                                  <div>
                                    <span className="font-medium">申请时间:</span> {formatDate(withdrawal.createdAt)}
                                  </div>
                                  <div>
                                    <span className="font-medium">银行账户:</span> {withdrawal.bankAccount || '未填写'}
                                  </div>
                                </div>
                                {withdrawal.fee && (
                                  <div className="mt-2 text-sm text-gray-500">
                                    <span className="font-medium">手续费:</span> ¥{withdrawal.fee.toFixed(2)}
                                  </div>
                                )}
                                {withdrawal.netAmount && (
                                  <div className="mt-2 text-sm text-gray-500">
                                    <span className="font-medium">实际到账:</span> ¥{withdrawal.netAmount.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">暂无提现记录</p>
                        <p className="text-sm text-gray-400 mt-1">点击上方按钮申请提现</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 对账报表 */}
            <TabsContent value="reconciliation" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>对账报表</CardTitle>
                      <CardDescription>查看您的收益统计和交易明细</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleExportReport}
                        disabled={isExporting}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {isExporting ? '导出中...' : '导出报表'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const startDate = prompt('请输入开始日期 (YYYY-MM-DD):', '')
                          const endDate = prompt('请输入结束日期 (YYYY-MM-DD):', '')
                          if (startDate && endDate) {
                            setDateRange({ start: startDate, end: endDate })
                            fetchData() // 重新获取数据
                          }
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        选择日期
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">¥{userStats.totalAmount.toFixed(2)}</div>
                      <div className="text-sm text-blue-600">总收益</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{userStats.completedOrders}</div>
                      <div className="text-sm text-green-600">成功订单</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{userStats.successRate}</div>
                      <div className="text-sm text-purple-600">成功率</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">最近交易</h3>
                    {orders.slice(0, 10).map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <div className="font-medium">订单 #{order.id.slice(-8)}</div>
                            <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">¥{Number(order.amount).toFixed(2)}</div>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 订单详情对话框 */}
        <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>订单详情</DialogTitle>
              <DialogDescription>
                查看订单的详细信息
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">订单ID</Label>
                    <p className="text-sm text-gray-600">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">状态</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">金额</Label>
                    <p className="text-sm text-gray-600">¥{Number(selectedOrder.amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">支付方式</Label>
                    <p className="text-sm text-gray-600">{selectedOrder.paymentMethod || '未设置'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">创建时间</Label>
                    <p className="text-sm text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">完成时间</Label>
                    <p className="text-sm text-gray-600">
                      {selectedOrder.completedAt ? formatDate(selectedOrder.completedAt) : '未完成'}
                    </p>
                  </div>
                </div>
                {selectedOrder.description && (
                  <div>
                    <Label className="text-sm font-medium">描述</Label>
                    <p className="text-sm text-gray-600">{selectedOrder.description}</p>
                  </div>
                )}
                {selectedOrder.paymentLinkId && (
                  <div>
                    <Label className="text-sm font-medium">关联收款链接</Label>
                    <p className="text-sm text-gray-600">{selectedOrder.paymentLinkId}</p>
                  </div>
                )}
                {selectedOrder.transactionId && (
                  <div>
                    <Label className="text-sm font-medium">交易ID</Label>
                    <p className="text-sm text-gray-600">{selectedOrder.transactionId}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 提现申请对话框 */}
        <Dialog open={isWithdrawalOpen} onOpenChange={setIsWithdrawalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>申请提现</DialogTitle>
              <DialogDescription>
                申请提现到您的银行账户
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="withdrawal-amount">提现金额</Label>
                <Input
                  id="withdrawal-amount"
                  type="number"
                  placeholder="请输入提现金额"
                  value={withdrawalForm.amount}
                  onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                />
                <p className="text-sm text-gray-500 mt-1">
                  可提现金额: ¥{userStats?.totalAmount?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <Label htmlFor="bank-account">银行账户</Label>
                <Input
                  id="bank-account"
                  placeholder="请输入银行账户信息"
                  value={withdrawalForm.bankAccount}
                  onChange={(e) => setWithdrawalForm({ ...withdrawalForm, bankAccount: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsWithdrawalOpen(false)}>
                  取消
                </Button>
                <Button 
                  onClick={handleWithdrawal}
                  disabled={!withdrawalForm.amount || !withdrawalForm.bankAccount}
                >
                  提交申请
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </UserGuard>
  )
}