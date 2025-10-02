"use client"

import { useState, useEffect } from "react"
import AdminGuard from "@/components/admin-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Download,
  Eye,
  MoreHorizontal,
  Plus,
  Filter,
  Search,
  BarChart3,
  Calendar,
  CheckCircle,
  Link as LinkIcon
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, Order, Payment, Withdrawal, FinancialReport } from "@/lib/types"
import { authService } from "@/lib/auth"
import Link from "next/link"

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user"
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userPaymentDetails, setUserPaymentDetails] = useState<any>(null)
  const [isPaymentDetailsOpen, setIsPaymentDetailsOpen] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 使用API获取数据
      const [usersResponse, ordersResponse, paymentsResponse, withdrawalsResponse, financialResponse] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/orders'),
        fetch('/api/payments'),
        fetch('/api/withdrawals'),
        fetch('/api/financial-report')
      ])
      
      const usersData = usersResponse.ok ? await usersResponse.json() : { users: [] }
      const ordersData = ordersResponse.ok ? await ordersResponse.json() : { orders: [] }
      const paymentsData = paymentsResponse.ok ? await paymentsResponse.json() : { payments: [] }
      const withdrawalsData = withdrawalsResponse.ok ? await withdrawalsResponse.json() : { withdrawals: [] }
      const financialData = financialResponse.ok ? await financialResponse.json() : null
      
      console.log('📊 加载的用户数据:', usersData.users?.length || 0, '个用户');
      
      setUsers(usersData.users || [])
      setOrders(ordersData.orders || [])
      setPayments(paymentsData.payments || [])
      setWithdrawals(withdrawalsData.withdrawals || [])
      setFinancialReport(financialData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleCreateUser = async () => {
    // 防止重复提交
    if (isCreatingUser) {
      return;
    }
    
    if (!newUser.name || !newUser.email || !newUser.phone || !newUser.password) {
      alert("请填写所有必需字段")
      return
    }

    setIsCreatingUser(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          password: newUser.password,
          role: newUser.role
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP错误！状态码: ${response.status}`);
      }
      
      const result = await response.json()

      if (result.success) {
        // 先关闭对话框和重置表单
        setNewUser({ name: "", email: "", phone: "", password: "", role: "user" })
        setIsCreateUserOpen(false)
        // 刷新用户数据
        await loadData()
        // 显示成功消息
        alert(result.message || '用户创建成功！')
      } else {
        alert(result.message || '创建用户失败')
      }
    } catch (error) {
      console.error('创建用户错误:', error)
      alert("创建用户失败：" + (error instanceof Error ? error.message : '网络错误'))
    } finally {
      setIsCreatingUser(false);
    }
  }

  const handleViewPaymentDetails = async (user: User) => {
    try {
      setSelectedUser(user)
      setIsPaymentDetailsOpen(true)
      
      const response = await fetch(`/api/admin/user-payment-details?userId=${user.id}`)
      const result = await response.json()
      
      if (result.success) {
        setUserPaymentDetails(result.data)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Error loading payment details:', error)
      alert("获取用户收款详情失败")
    }
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // 获取所有数据
      const [usersRes, ordersRes, paymentsRes, withdrawalsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/orders'),
        fetch('/api/payments'),
        fetch('/api/withdrawals')
      ])

      const [usersData, ordersData, paymentsData, withdrawalsData] = await Promise.all([
        usersRes.json(),
        ordersRes.json(),
        paymentsRes.json(),
        withdrawalsRes.json()
      ])

      // 创建CSV内容
      const csvContent = createExportCSV({
        users: usersData.users || [],
        orders: ordersData.orders || [],
        payments: paymentsData.payments || [],
        withdrawals: withdrawalsData.withdrawals || []
      })

      // 下载文件
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `管理员数据导出_${new Date().toISOString().split('T')[0]}.csv`)
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

  const createExportCSV = (data: any) => {
    let csvContent = ''
    
    // 用户数据
    if (data.users.length > 0) {
      csvContent += '=== 用户数据 ===\n'
      const userHeaders = ['ID', '姓名', '邮箱', '电话', '角色', '状态', '余额', '创建时间']
      csvContent += userHeaders.join(',') + '\n'
      csvContent += data.users.map((user: any) => [
        user.id,
        user.name,
        user.email,
        user.phone || '',
        user.role,
        user.status,
        user.balance || 0,
        user.createdAt
      ]).map((row: any[]) => row.join(',')).join('\n') + '\n\n'
    }

    // 订单数据
    if (data.orders.length > 0) {
      csvContent += '=== 订单数据 ===\n'
      const orderHeaders = ['ID', '用户', '金额', '状态', '支付方式', '创建时间', '完成时间']
      csvContent += orderHeaders.join(',') + '\n'
      csvContent += data.orders.map((order: any) => [
        order.id,
        order.userName || order.userEmail || order.userId,
        order.amount,
        order.status,
        order.paymentMethod || '',
        order.createdAt,
        order.completedAt || ''
      ]).map((row: any[]) => row.join(',')).join('\n') + '\n\n'
    }

    // 支付数据
    if (data.payments.length > 0) {
      csvContent += '=== 支付数据 ===\n'
      const paymentHeaders = ['ID', '订单ID', '金额', '状态', '支付方式', '交易ID', '创建时间']
      csvContent += paymentHeaders.join(',') + '\n'
      csvContent += data.payments.map((payment: any) => [
        payment.id,
        payment.orderId || '',
        payment.amount,
        payment.status,
        payment.paymentMethod || '',
        payment.transactionId || '',
        payment.createdAt
      ]).map((row: any[]) => row.join(',')).join('\n') + '\n\n'
    }

    // 提现数据
    if (data.withdrawals.length > 0) {
      csvContent += '=== 提现数据 ===\n'
      const withdrawalHeaders = ['ID', '用户ID', '金额', '状态', '银行账户', '申请时间']
      csvContent += withdrawalHeaders.join(',') + '\n'
      csvContent += data.withdrawals.map((withdrawal: any) => [
        withdrawal.id,
        withdrawal.userId,
        withdrawal.amount,
        withdrawal.status,
        withdrawal.bankAccount || '',
        withdrawal.requestDate
      ]).map((row: any[]) => row.join(',')).join('\n') + '\n'
    }

    return csvContent
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, label: "活跃" },
      inactive: { variant: "secondary" as const, label: "非活跃" },
      suspended: { variant: "destructive" as const, label: "已暂停" },
      pending: { variant: "secondary" as const, label: "待处理" },
      paid: { variant: "default" as const, label: "已支付" },
      processing: { variant: "secondary" as const, label: "处理中" },
      shipped: { variant: "default" as const, label: "已发货" },
      delivered: { variant: "default" as const, label: "已送达" },
      cancelled: { variant: "destructive" as const, label: "已取消" },
      refunded: { variant: "destructive" as const, label: "已退款" },
      success: { variant: "default" as const, label: "成功" },
      failed: { variant: "destructive" as const, label: "失败" },
      approved: { variant: "default" as const, label: "已批准" },
      rejected: { variant: "destructive" as const, label: "已拒绝" },
      completed: { variant: "default" as const, label: "已完成" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '未知时间'
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date)
      
      // 检查日期是否有效
      if (isNaN(dateObj.getTime())) {
        return '无效时间'
      }
      
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj)
    } catch (error) {
      console.error('日期格式化错误:', error, '原始值:', date)
      return '时间错误'
    }
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 mobile-scroll no-bounce">
      {/* Header */}
      <header className="bg-white shadow-sm border-b mobile-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">管理员后台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="mobile-button"
                onClick={handleExportData}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{isExporting ? '导出中...' : '导出数据'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mobile-content">
        {/* 统计卡片 */}
        <div className="mobile-stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                活跃用户: {users.filter(u => u.status === 'active').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总订单数</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">
                今日订单: {orders.filter(o => {
                  const today = new Date()
                  const orderDate = new Date(o.createdAt)
                  return orderDate.toDateString() === today.toDateString()
                }).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总交易额</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(orders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                今日交易: {formatCurrency(orders.filter(o => {
                  const today = new Date()
                  const orderDate = new Date(o.createdAt)
                  return orderDate.toDateString() === today.toDateString()
                }).reduce((sum, order) => sum + (Number(order.amount) || 0), 0))}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平台收益</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(financialReport?.platformFee || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                净利润: {formatCurrency(financialReport?.netRevenue || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">收款成功总金额</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(orders.filter(o => o.status === 'completed').reduce((sum, order) => sum + (Number(order.amount) || 0), 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                成功订单: {orders.filter(o => o.status === 'completed').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日收款额</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(orders.filter(o => {
                  const today = new Date()
                  const orderDate = new Date(o.createdAt)
                  return orderDate.toDateString() === today.toDateString() && o.status === 'completed'
                }).reduce((sum, order) => sum + (Number(order.amount) || 0), 0))}
              </div>
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

        {/* 主要内容 */}
        <Tabs defaultValue="users" className="space-y-6">
          <div className="mobile-tabs">
            <TabsList className="w-full">
              <TabsTrigger value="users">用户管理</TabsTrigger>
              <TabsTrigger value="orders">订单管理</TabsTrigger>
              <TabsTrigger value="payments">支付记录</TabsTrigger>
              <TabsTrigger value="withdrawals">提现管理</TabsTrigger>
              <TabsTrigger value="reports">财务报表</TabsTrigger>
              <TabsTrigger value="data">数据管理</TabsTrigger>
            </TabsList>
          </div>

          {/* 用户管理 */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>用户管理</CardTitle>
                    <CardDescription>管理系统中的所有用户</CardDescription>
                  </div>
                  <div className="mobile-button-group flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="relative mobile-search">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="搜索用户..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full sm:w-64 mobile-input"
                      />
                    </div>
                    <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="mobile-button">
                          <Plus className="h-4 w-4 mr-2" />
                          添加用户
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="mobile-dialog sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>创建新用户</DialogTitle>
                          <DialogDescription>
                            创建一个具有工作台访问权限的用户账号
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              姓名
                            </Label>
                            <Input
                              id="name"
                              value={newUser.name}
                              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                              邮箱
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={newUser.email}
                              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                              电话
                            </Label>
                            <Input
                              id="phone"
                              value={newUser.phone}
                              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">
                              密码
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={newUser.password}
                              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                              className="col-span-3"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                              角色
                            </Label>
                            <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                              <SelectTrigger className="col-span-3">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">普通用户</SelectItem>
                                <SelectItem value="merchant">商户</SelectItem>
                                <SelectItem value="admin">管理员</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={() => {
                              console.log('点击了取消按钮');
                              setIsCreateUserOpen(false);
                            }}
                          >
                            取消
                          </Button>
                          <Button 
                            type="button"
                            onClick={handleCreateUser}
                            disabled={isCreatingUser}
                          >
                            {isCreatingUser ? "创建中..." : "创建用户"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mobile-table-container">
                  <Table className="mobile-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>用户ID</TableHead>
                        <TableHead>姓名</TableHead>
                        <TableHead>邮箱</TableHead>
                        <TableHead>电话</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>用户类型</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>余额</TableHead>
                        <TableHead>注册时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.phone}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="mobile-badge">
                              {user.role === 'admin' ? '管理员' : user.role === 'merchant' ? '商户' : '用户'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.userType === 'admin_created' ? 'default' : 'outline'} className="mobile-badge">
                              {user.userType === 'admin_created' ? '管理员创建' : user.userType === 'dashboard_user' ? '工作台用户' : '注册用户'}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(user.status || 'active')}</TableCell>
                          <TableCell>{formatCurrency(user.balance || 0)}</TableCell>
                          <TableCell>{formatDate(user.createdAt)}</TableCell>
                          <TableCell>
                            <div className="mobile-actions flex items-center space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mobile-button"
                                onClick={() => handleViewPaymentDetails(user)}
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="mobile-button">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 订单管理 */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>订单管理</CardTitle>
                    <CardDescription>管理所有订单和交易</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="筛选状态" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="pending">待支付</SelectItem>
                        <SelectItem value="paid">已支付</SelectItem>
                        <SelectItem value="processing">处理中</SelectItem>
                        <SelectItem value="shipped">已发货</SelectItem>
                        <SelectItem value="delivered">已送达</SelectItem>
                        <SelectItem value="cancelled">已取消</SelectItem>
                        <SelectItem value="refunded">已退款</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="搜索订单..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单ID</TableHead>
                      <TableHead>用户</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>支付方式</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.userId}</TableCell>
                        <TableCell>{formatCurrency(order.amount)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{order.paymentMethod}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 支付记录 */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>支付记录</CardTitle>
                <CardDescription>查看所有支付交易记录</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>支付ID</TableHead>
                      <TableHead>订单ID</TableHead>
                      <TableHead>用户ID</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>支付方式</TableHead>
                      <TableHead>创建时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.id}</TableCell>
                        <TableCell>{payment.orderId}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(payment.amount))}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 提现管理 */}
          <TabsContent value="withdrawals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>提现管理</CardTitle>
                <CardDescription>处理用户提现申请</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>提现ID</TableHead>
                      <TableHead>用户ID</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>手续费</TableHead>
                      <TableHead>实际到账</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>申请时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="font-medium">{withdrawal.id}</TableCell>
                        <TableCell>{withdrawal.userId}</TableCell>
                        <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
                        <TableCell>{formatCurrency(withdrawal.fee || 0)}</TableCell>
                        <TableCell>{formatCurrency(withdrawal.netAmount || withdrawal.amount)}</TableCell>
                        <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                        <TableCell>{formatDate(withdrawal.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {withdrawal.status === 'pending' && (
                              <>
                                <Button size="sm" variant="default">批准</Button>
                                <Button size="sm" variant="destructive">拒绝</Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 财务报表 */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>财务报表</CardTitle>
                <CardDescription>查看平台财务数据和分析</CardDescription>
              </CardHeader>
              <CardContent>
                {financialReport && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">总营收</p>
                      <p className="text-2xl font-bold">{formatCurrency(financialReport.totalSales)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">总订单数</p>
                      <p className="text-2xl font-bold">{financialReport.totalOrders}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">平台费用</p>
                      <p className="text-2xl font-bold">{formatCurrency(financialReport.platformFee)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">净利润</p>
                      <p className="text-2xl font-bold">{formatCurrency(financialReport.netRevenue)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据管理 */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>数据管理</CardTitle>
                <CardDescription>管理系统数据和存储</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">数据管理功能已移至独立页面</p>
                  <Link href="/admin/data-management">
                    <Button>
                      进入数据管理页面
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* 用户收款详情对话框 */}
      <Dialog open={isPaymentDetailsOpen} onOpenChange={setIsPaymentDetailsOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>用户收款详情</DialogTitle>
            <DialogDescription>
              {selectedUser && `查看 ${selectedUser.name} (${selectedUser.email}) 的收款情况`}
            </DialogDescription>
          </DialogHeader>
          
          {userPaymentDetails && (
            <div className="space-y-6">
              {/* 用户基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">用户信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">姓名</p>
                      <p className="font-medium">{userPaymentDetails.user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">邮箱</p>
                      <p className="font-medium">{userPaymentDetails.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">电话</p>
                      <p className="font-medium">{userPaymentDetails.user.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">状态</p>
                      <p className="font-medium">{getStatusBadge(userPaymentDetails.user.status)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 收款统计 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">收款统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{userPaymentDetails.summary.totalLinks}</p>
                      <p className="text-sm text-muted-foreground">收款链接</p>
                      <p className="text-xs text-muted-foreground">活跃: {userPaymentDetails.summary.activeLinks}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{userPaymentDetails.summary.totalOrders}</p>
                      <p className="text-sm text-muted-foreground">总订单</p>
                      <p className="text-xs text-muted-foreground">已完成: {userPaymentDetails.summary.completedOrders}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{userPaymentDetails.summary.totalPayments}</p>
                      <p className="text-sm text-muted-foreground">支付记录</p>
                      <p className="text-xs text-muted-foreground">成功: {userPaymentDetails.summary.successfulPayments}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{formatCurrency(userPaymentDetails.summary.totalAmount)}</p>
                      <p className="text-sm text-muted-foreground">总收款</p>
                      <p className="text-xs text-muted-foreground">成功率: {userPaymentDetails.summary.successRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 收款链接详情 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">收款链接详情</CardTitle>
                  <CardDescription>查看每个收款链接的详细情况</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userPaymentDetails.linkDetails.map((link: any) => (
                      <div key={link.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <LinkIcon className="h-4 w-4" />
                            <span className="font-medium">{link.description}</span>
                            <Badge variant={link.status === 'active' ? 'default' : 'secondary'}>
                              {link.status === 'active' ? '活跃' : '已完成'}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">金额: {formatCurrency(link.amount)}</p>
                            <p className="text-sm text-muted-foreground">收款: {formatCurrency(link.totalAmount)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">订单数</p>
                            <p className="font-medium">{link.orders.length}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">支付数</p>
                            <p className="font-medium">{link.payments.length}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">成功支付</p>
                            <p className="font-medium">{link.successCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">创建时间</p>
                            <p className="font-medium">{formatDate(link.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 每日收款统计 */}
              {userPaymentDetails.dailyStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">每日收款统计</CardTitle>
                    <CardDescription>最近7天的收款情况</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {userPaymentDetails.dailyStats.slice(0, 7).map((day: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{day.date}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{day.count} 笔支付</p>
                            <p className="text-sm text-muted-foreground">{formatCurrency(day.amount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </AdminGuard>
  )
}
