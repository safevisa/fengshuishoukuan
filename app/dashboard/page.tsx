"use client"

import { useState, useEffect } from "react"
import UserGuard from "@/components/user-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  DollarSign, 
  ShoppingCart, 
  Link as LinkIcon,
  RefreshCw,
  AlertCircle,
  Plus,
  Share,
  Trash2
} from "lucide-react"

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

interface PaymentLink {
  id: string
  userId: string
  amount: number
  description: string
  status: string
  paymentUrl: string
  paymentMethod: string
  transactionId?: string
  createdAt: string
  updatedAt: string
}

export default function UserDashboard() {
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm, setCreateForm] = useState({
    amount: '',
    description: ''
  })
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

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
      console.log(' [前端] 获取数据，用户:', user)

      // 获取支付统计
      const statsResponse = await fetch('/api/payment-stats')
      const statsData = await statsResponse.json()

      if (statsData.success) {
        setStats(statsData.data)
      } else {
        throw new Error(statsData.message || '获取统计数据失败')
      }

      // 获取当前用户的支付链接
      console.log(' [前端] 请求支付链接，用户ID:', user.id)
      const linksResponse = await fetch(`/api/payment-links?userId=${user.id}`)
      const linksData = await linksResponse.json()

      console.log(' [前端] 支付链接响应:', linksData)

      if (Array.isArray(linksData)) {
        setPaymentLinks(linksData)
      } else if (linksData.success === false) {
        throw new Error(linksData.message || '获取支付链接失败')
      } else {
        // 如果返回的是包装对象，提取data字段
        const actualLinks = linksData.data || linksData
        if (Array.isArray(actualLinks)) {
          setPaymentLinks(actualLinks)
        } else {
          throw new Error('支付链接数据格式错误')
        }
      }

    } catch (err) {
      console.error('获取数据失败:', err)
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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

      console.log(' [前端] 使用用户ID:', user.id);

      const response = await fetch('/api/payment-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(createForm.amount),
          description: createForm.description,
          userId: user.id // 使用真实的用户ID
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('收款链接创建成功！')
        setCreateForm({ amount: '', description: '' })
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
        console.log('分享取消')
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
            <h1 className="text-3xl font-bold text-gray-900">用户工作台</h1>
            <p className="text-gray-600 mt-2">查看您的支付统计和收款链接</p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总订单</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalStats.totalOrders || 0}</div>
                <p className="text-xs text-muted-foreground">
                  成功订单: {stats?.totalStats.successPayments || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总支付</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{stats?.totalStats.successAmount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  成功率: {stats?.totalStats.successRate || '0%'}
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
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalStats.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  活跃用户
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 收款链接管理 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>收款链接</CardTitle>
                  <CardDescription>您的所有收款链接</CardDescription>
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
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={createLoading}>
                      {createLoading ? '创建中...' : '创建链接'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setCreateForm({ amount: '', description: '' })}
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
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{link.description}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            金额: ¥{link.amount} | 创建时间: {link.createdAt ? new Date(link.createdAt).toLocaleString() : '未知时间'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 break-all">
                            链接: {link.paymentUrl || '链接生成中...'}
                          </p>
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
        </div>
      </div>
    </UserGuard>
  )
}
