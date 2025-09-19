"use client"

import { useState, useEffect } from "react"
import UserGuard from "@/components/user-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  DollarSign, 
  ShoppingCart, 
  CreditCard, 
  TrendingUp, 
  Plus,
  Copy,
  Eye,
  Download,
  Settings,
  Wallet,
  BarChart3
} from "lucide-react"
import { PaymentLink, Order, Withdrawal, User } from "@/lib/types"
import { db } from "@/lib/database"
import { paymentService } from "@/lib/payment"

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [isCreateLinkOpen, setIsCreateLinkOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [newLink, setNewLink] = useState({
    title: "",
    description: "",
    amount: 0,
    currency: "CNY",
    expiresAt: "",
    maxUses: ""
  })
  const [withdrawalData, setWithdrawalData] = useState({
    amount: 0,
    method: "bank",
    accountInfo: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      phone: ""
    }
  })

  useEffect(() => {
    // 模拟获取当前用户（实际应用中应该从认证系统获取）
    const currentUser = db.getUserById("user-001") || db.getAllUsers().find(u => u.role === 'user')
    if (currentUser) {
      setUser(currentUser)
      setPaymentLinks(db.getPaymentLinksByUserId(currentUser.id))
      setOrders(db.getOrdersByUserId(currentUser.id))
      setWithdrawals(db.getWithdrawalsByUserId(currentUser.id))
    }
  }, [])

  const handleCreatePaymentLink = async () => {
    if (!user || !newLink.title || !newLink.amount) return

    const link: PaymentLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      title: newLink.title,
      description: newLink.description,
      amount: newLink.amount,
      currency: newLink.currency,
      isActive: true,
      expiresAt: newLink.expiresAt ? new Date(newLink.expiresAt) : undefined,
      maxUses: newLink.maxUses ? parseInt(newLink.maxUses) : undefined,
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const createdLink = db.createPaymentLink(link)
    setPaymentLinks(prev => [...prev, createdLink])
    setNewLink({
      title: "",
      description: "",
      amount: 0,
      currency: "CNY",
      expiresAt: "",
      maxUses: ""
    })
    setIsCreateLinkOpen(false)
  }

  const handleWithdraw = async () => {
    if (!user || !withdrawalData.amount) return

    const fee = db.calculateFee(withdrawalData.amount, 'fee-002')
    const netAmount = withdrawalData.amount - fee

    const withdrawal: Withdrawal = {
      id: `withdrawal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      amount: withdrawalData.amount,
      fee,
      netAmount,
      method: withdrawalData.method as 'bank' | 'alipay' | 'wechat',
      accountInfo: withdrawalData.accountInfo,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const createdWithdrawal = db.createWithdrawal(withdrawal)
    setWithdrawals(prev => [...prev, createdWithdrawal])
    setWithdrawalData({
      amount: 0,
      method: "bank",
      accountInfo: {
        bankName: "",
        accountNumber: "",
        accountName: "",
        phone: ""
      }
    })
    setIsWithdrawOpen(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // 这里可以添加一个toast通知
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, label: "活跃" },
      inactive: { variant: "secondary" as const, label: "非活跃" },
      pending: { variant: "secondary" as const, label: "待处理" },
      approved: { variant: "default" as const, label: "已批准" },
      rejected: { variant: "destructive" as const, label: "已拒绝" },
      completed: { variant: "default" as const, label: "已完成" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { variant: "secondary" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }

  return (
    <UserGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">我的工作台</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">账户余额</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(user.balance)}</p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                设置
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">账户余额</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(user.balance)}</div>
              <p className="text-xs text-muted-foreground">
                总收益: {formatCurrency(user.totalEarnings)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">收款链接</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentLinks.length}</div>
              <p className="text-xs text-muted-foreground">
                活跃链接: {paymentLinks.filter(l => l.isActive).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总订单</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">
                本月订单: {orders.filter(o => {
                  const now = new Date()
                  const orderDate = new Date(o.createdAt)
                  return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">提现记录</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{withdrawals.length}</div>
              <p className="text-xs text-muted-foreground">
                总提现: {formatCurrency(user.totalWithdrawals)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容 */}
        <Tabs defaultValue="links" className="space-y-6">
          <TabsList>
            <TabsTrigger value="links">收款链接</TabsTrigger>
            <TabsTrigger value="orders">订单管理</TabsTrigger>
            <TabsTrigger value="withdrawals">提现管理</TabsTrigger>
            <TabsTrigger value="analytics">数据分析</TabsTrigger>
          </TabsList>

          {/* 收款链接 */}
          <TabsContent value="links" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>收款链接管理</CardTitle>
                    <CardDescription>创建和管理您的收款链接</CardDescription>
                  </div>
                  <Dialog open={isCreateLinkOpen} onOpenChange={setIsCreateLinkOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        创建收款链接
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>创建收款链接</DialogTitle>
                        <DialogDescription>
                          创建一个新的收款链接，客户可以通过此链接向您付款
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">链接标题</Label>
                          <Input
                            id="title"
                            value={newLink.title}
                            onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="请输入链接标题"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">描述</Label>
                          <Textarea
                            id="description"
                            value={newLink.description}
                            onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="请输入链接描述（可选）"
                          />
                        </div>
                        <div>
                          <Label htmlFor="amount">金额</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={newLink.amount}
                            onChange={(e) => setNewLink(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                            placeholder="请输入金额"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="currency">货币</Label>
                            <Select value={newLink.currency} onValueChange={(value) => setNewLink(prev => ({ ...prev, currency: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                                <SelectItem value="USD">美元 (USD)</SelectItem>
                                <SelectItem value="HKD">港币 (HKD)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="maxUses">最大使用次数</Label>
                            <Input
                              id="maxUses"
                              type="number"
                              value={newLink.maxUses}
                              onChange={(e) => setNewLink(prev => ({ ...prev, maxUses: e.target.value }))}
                              placeholder="留空表示无限制"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="expiresAt">过期时间</Label>
                          <Input
                            id="expiresAt"
                            type="datetime-local"
                            value={newLink.expiresAt}
                            onChange={(e) => setNewLink(prev => ({ ...prev, expiresAt: e.target.value }))}
                          />
                        </div>
                        <Button onClick={handleCreatePaymentLink} className="w-full">
                          创建链接
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>链接ID</TableHead>
                      <TableHead>标题</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>使用次数</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium">{link.id}</TableCell>
                        <TableCell>{link.title}</TableCell>
                        <TableCell>{formatCurrency(link.amount)}</TableCell>
                        <TableCell>
                          {link.usedCount}
                          {link.maxUses && ` / ${link.maxUses}`}
                        </TableCell>
                        <TableCell>{getStatusBadge(link.isActive ? 'active' : 'inactive')}</TableCell>
                        <TableCell>{formatDate(link.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(`${window.location.origin}/pay/${link.id}`)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
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

          {/* 订单管理 */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>订单管理</CardTitle>
                <CardDescription>查看和管理您的订单</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单ID</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>支付方式</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{order.paymentMethod}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>提现管理</CardTitle>
                    <CardDescription>申请提现和管理提现记录</CardDescription>
                  </div>
                  <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        申请提现
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>申请提现</DialogTitle>
                        <DialogDescription>
                          从您的账户余额中申请提现
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="amount">提现金额</Label>
                          <Input
                            id="amount"
                            type="number"
                            value={withdrawalData.amount}
                            onChange={(e) => setWithdrawalData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                            placeholder="请输入提现金额"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            手续费: {formatCurrency(db.calculateFee(withdrawalData.amount, 'fee-002'))}
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="method">提现方式</Label>
                          <Select value={withdrawalData.method} onValueChange={(value) => setWithdrawalData(prev => ({ ...prev, method: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bank">银行转账</SelectItem>
                              <SelectItem value="alipay">支付宝</SelectItem>
                              <SelectItem value="wechat">微信</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {withdrawalData.method === 'bank' && (
                          <>
                            <div>
                              <Label htmlFor="bankName">银行名称</Label>
                              <Input
                                id="bankName"
                                value={withdrawalData.accountInfo.bankName}
                                onChange={(e) => setWithdrawalData(prev => ({ 
                                  ...prev, 
                                  accountInfo: { ...prev.accountInfo, bankName: e.target.value }
                                }))}
                                placeholder="请输入银行名称"
                              />
                            </div>
                            <div>
                              <Label htmlFor="accountNumber">账户号码</Label>
                              <Input
                                id="accountNumber"
                                value={withdrawalData.accountInfo.accountNumber}
                                onChange={(e) => setWithdrawalData(prev => ({ 
                                  ...prev, 
                                  accountInfo: { ...prev.accountInfo, accountNumber: e.target.value }
                                }))}
                                placeholder="请输入账户号码"
                              />
                            </div>
                            <div>
                              <Label htmlFor="accountName">账户姓名</Label>
                              <Input
                                id="accountName"
                                value={withdrawalData.accountInfo.accountName}
                                onChange={(e) => setWithdrawalData(prev => ({ 
                                  ...prev, 
                                  accountInfo: { ...prev.accountInfo, accountName: e.target.value }
                                }))}
                                placeholder="请输入账户姓名"
                              />
                            </div>
                          </>
                        )}
                        <Button onClick={handleWithdraw} className="w-full">
                          提交申请
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>提现ID</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>手续费</TableHead>
                      <TableHead>实际到账</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>申请时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="font-medium">{withdrawal.id}</TableCell>
                        <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
                        <TableCell>{formatCurrency(withdrawal.fee)}</TableCell>
                        <TableCell>{formatCurrency(withdrawal.netAmount)}</TableCell>
                        <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                        <TableCell>{formatDate(withdrawal.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据分析 */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>数据分析</CardTitle>
                <CardDescription>查看您的业务数据和趋势</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">本月收入</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(orders.filter(o => {
                        const now = new Date()
                        const orderDate = new Date(o.createdAt)
                        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
                      }).reduce((sum, order) => sum + order.totalAmount, 0))}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">本月订单</p>
                    <p className="text-2xl font-bold">
                      {orders.filter(o => {
                        const now = new Date()
                        const orderDate = new Date(o.createdAt)
                        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
                      }).length}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">平均订单金额</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(orders.length > 0 ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </UserGuard>
  )
}
