"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Phone, Mail, Package, Truck, CheckCircle, Clock, Eye } from "lucide-react"
import Link from "next/link"

// Mock orders data
const mockOrders = [
  {
    id: "ORD-2024-001",
    date: "2024-01-15",
    status: "delivered",
    total: 16400,
    items: [
      {
        id: 1,
        name: "招財貔貅擺件",
        price: 3800,
        quantity: 2,
        image: "/golden-pixiu-feng-shui-ornament.jpg",
      },
      {
        id: 2,
        name: "紫水晶洞",
        price: 8800,
        quantity: 1,
        image: "/amethyst-geode-feng-shui-crystal.jpg",
      },
    ],
    shippingAddress: {
      name: "王小明",
      phone: "+886 912345678",
      address: "台北市信義區信義路五段7號",
    },
    trackingNumber: "TW123456789",
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-20",
    status: "shipping",
    total: 4000,
    items: [
      {
        id: 3,
        name: "五帝錢掛飾",
        price: 1200,
        quantity: 1,
        image: "/five-emperor-coins-feng-shui-charm.jpg",
      },
      {
        id: 4,
        name: "水晶龍龜",
        price: 2800,
        quantity: 1,
        image: "/crystal-dragon-turtle-feng-shui.jpg",
      },
    ],
    shippingAddress: {
      name: "王小明",
      phone: "+886 912345678",
      address: "台北市信義區信義路五段7號",
    },
    trackingNumber: "TW987654321",
  },
  {
    id: "ORD-2024-003",
    date: "2024-01-25",
    status: "processing",
    total: 5600,
    items: [
      {
        id: 5,
        name: "觀音蓮花座",
        price: 5600,
        quantity: 1,
        image: "/guanyin-lotus-feng-shui-statue.jpg",
      },
    ],
    shippingAddress: {
      name: "王小明",
      phone: "+886 912345678",
      address: "台北市信義區信義路五段7號",
    },
  },
  {
    id: "ORD-2024-004",
    date: "2024-01-28",
    status: "pending",
    total: 2200,
    items: [
      {
        id: 6,
        name: "風水羅盤",
        price: 2200,
        quantity: 1,
        image: "/feng-shui-compass-luopan.jpg",
      },
    ],
    shippingAddress: {
      name: "王小明",
      phone: "+886 912345678",
      address: "台北市信義區信義路五段7號",
    },
  },
]

const getStatusInfo = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "待處理", color: "bg-yellow-500", icon: Clock }
    case "processing":
      return { label: "處理中", color: "bg-blue-500", icon: Package }
    case "shipping":
      return { label: "配送中", color: "bg-purple-500", icon: Truck }
    case "delivered":
      return { label: "已送達", color: "bg-green-500", icon: CheckCircle }
    default:
      return { label: "未知", color: "bg-gray-500", icon: Clock }
  }
}

export default function OrdersPage() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  const filteredOrders = mockOrders.filter((order) => {
    if (selectedTab === "all") return true
    return order.status === selectedTab
  })

  const orderDetail = selectedOrder ? mockOrders.find((order) => order.id === selectedOrder) : null

  if (orderDetail) {
    const statusInfo = getStatusInfo(orderDetail.status)
    const StatusIcon = statusInfo.icon

    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex items-center space-x-4 text-amber-600 hover:text-amber-700"
              >
                <ArrowLeft className="h-5 w-5" />
                <div className="text-2xl font-bold text-amber-800">京世盈風水</div>
              </button>

              <div className="hidden md:flex items-center space-x-4 text-sm text-amber-700">
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>+852 61588111</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>service@crf.hk</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amber-800 mb-2">訂單詳情</h1>
            <p className="text-amber-600">訂單編號：{orderDetail.id}</p>
          </div>

          <div className="space-y-6">
            {/* Order Status */}
            <Card className="border-amber-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-amber-800 flex items-center">
                      <StatusIcon className="h-5 w-5 mr-2" />
                      訂單狀態
                    </CardTitle>
                    <CardDescription className="text-amber-600">
                      訂單日期：{new Date(orderDetail.date).toLocaleDateString("zh-TW")}
                    </CardDescription>
                  </div>
                  <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {orderDetail.trackingNumber && (
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-2">物流追蹤</h4>
                    <p className="text-sm text-amber-700">追蹤號碼：{orderDetail.trackingNumber}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                    >
                      查看物流詳情
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800">商品清單</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderDetail.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-amber-800">{item.name}</h4>
                        <p className="text-sm text-amber-600">數量：{item.quantity}</p>
                        <p className="text-sm text-amber-600">單價：NT$ {item.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-amber-800">
                          NT$ {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold text-amber-800">
                  <span>訂單總額</span>
                  <span>NT$ {orderDetail.total.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800">收貨地址</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-amber-700 space-y-1">
                  <p className="font-medium">{orderDetail.shippingAddress.name}</p>
                  <p>{orderDetail.shippingAddress.phone}</p>
                  <p>{orderDetail.shippingAddress.address}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/profile" className="flex items-center space-x-4">
              <ArrowLeft className="h-5 w-5 text-amber-600" />
              <div className="text-2xl font-bold text-amber-800">京世盈風水</div>
            </Link>

            <div className="hidden md:flex items-center space-x-4 text-sm text-amber-700">
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>+852 61588111</span>
              </div>
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>service@crf.hk</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-800 mb-2">我的訂單</h1>
          <p className="text-amber-600">查看您的訂單歷史和狀態</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-amber-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              全部訂單
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              待處理
            </TabsTrigger>
            <TabsTrigger value="processing" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              處理中
            </TabsTrigger>
            <TabsTrigger value="shipping" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              配送中
            </TabsTrigger>
            <TabsTrigger value="delivered" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              已送達
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            {filteredOrders.length === 0 ? (
              <Card className="border-amber-200">
                <CardContent className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-amber-300 mb-4" />
                  <h3 className="text-lg font-medium text-amber-800 mb-2">暫無訂單</h3>
                  <p className="text-amber-600 mb-4">您還沒有任何訂單記錄</p>
                  <Link href="/">
                    <Button className="bg-amber-600 hover:bg-amber-700">開始購物</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status)
                  const StatusIcon = statusInfo.icon

                  return (
                    <Card key={order.id} className="border-amber-200 hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-amber-800">{order.id}</h3>
                            <p className="text-sm text-amber-600">{new Date(order.date).toLocaleDateString("zh-TW")}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={`${statusInfo.color} text-white`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order.id)}
                              className="border-amber-300 text-amber-700 hover:bg-amber-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              查看詳情
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, index) => (
                              <img
                                key={item.id}
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg border-2 border-white"
                                style={{ zIndex: 10 - index }}
                              />
                            ))}
                            {order.items.length > 3 && (
                              <div className="w-12 h-12 bg-amber-100 rounded-lg border-2 border-white flex items-center justify-center text-xs font-medium text-amber-700">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-amber-700">{order.items.length} 件商品</p>
                            <p className="text-sm text-amber-600">{order.items.map((item) => item.name).join("、")}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-amber-600">收貨人：{order.shippingAddress.name}</div>
                          <div className="text-lg font-bold text-amber-800">NT$ {order.total.toLocaleString()}</div>
                        </div>

                        {order.trackingNumber && (
                          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-xs text-amber-700">追蹤號碼：{order.trackingNumber}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
