"use client"

import { useState, useEffect } from "react"
import UserGuard from "@/components/user-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, CreditCard, Plus, Edit, Trash2, ArrowLeft, Save, Shield, Package } from "lucide-react"
import Link from "next/link"

// 默认用户数据
const defaultUser = {
  name: "",
  email: "",
  phone: "",
  address: "",
  birthDate: "",
  gender: "男",
}

// Mock payment cards
const mockCards = [
  {
    id: 1,
    type: "VISA",
    lastFour: "4321",
    expiryMonth: "12",
    expiryYear: "2025",
    holderName: "WANG XIAO MING",
    isDefault: true,
  },
  {
    id: 2,
    type: "MasterCard",
    lastFour: "8765",
    expiryMonth: "08",
    expiryYear: "2026",
    holderName: "WANG XIAO MING",
    isDefault: false,
  },
]

export default function ProfilePage() {
  const [user, setUser] = useState(defaultUser)
  const [cards, setCards] = useState(mockCards)
  const [isEditing, setIsEditing] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCard, setNewCard] = useState({
    number: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    holderName: "",
  })

  // 从localStorage加载用户数据
  useEffect(() => {
    const loadUserData = () => {
      const currentUser = localStorage.getItem("current_user")
      if (currentUser) {
        try {
          const userData = JSON.parse(currentUser)
          setUser({
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            birthDate: userData.birthDate || "",
            gender: userData.gender || "男",
          })
        } catch (error) {
          console.error("Failed to parse user data:", error)
        }
      }
    }

    loadUserData()
  }, [])

  const handleSaveProfile = () => {
    // 保存到localStorage
    const currentUser = localStorage.getItem("current_user")
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser)
        const updatedUser = { ...userData, ...user }
        localStorage.setItem("current_user", JSON.stringify(updatedUser))
        alert("個人資料已更新")
      } catch (error) {
        console.error("Failed to save user data:", error)
        alert("保存失敗，請重試")
      }
    }
    setIsEditing(false)
  }

  const handleAddCard = () => {
    const card = {
      id: cards.length + 1,
      type: newCard.number.startsWith("4") ? "VISA" : "MasterCard",
      lastFour: newCard.number.slice(-4),
      expiryMonth: newCard.expiryMonth,
      expiryYear: newCard.expiryYear,
      holderName: newCard.holderName,
      isDefault: cards.length === 0,
    }
    setCards([...cards, card])
    setNewCard({ number: "", expiryMonth: "", expiryYear: "", cvv: "", holderName: "" })
    setShowAddCard(false)
    alert("信用卡已添加")
  }

  const handleDeleteCard = (cardId: number) => {
    if (confirm("確定要刪除此信用卡嗎？")) {
      setCards(cards.filter((card) => card.id !== cardId))
    }
  }

  const handleSetDefaultCard = (cardId: number) => {
    setCards(
      cards.map((card) => ({
        ...card,
        isDefault: card.id === cardId,
      })),
    )
  }

  return (
    <UserGuard>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-4">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-800 mb-2">會員中心</h1>
          <p className="text-amber-600">管理您的個人資料和付款方式</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-amber-100">
            <TabsTrigger value="profile" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              個人資料
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              付款方式
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              我的訂單
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-amber-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-amber-800">個人資料</CardTitle>
                    <CardDescription className="text-amber-600">管理您的基本資料和聯絡方式</CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                    className={
                      isEditing
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "border-amber-300 text-amber-700 hover:bg-amber-50"
                    }
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        保存
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        編輯
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-amber-700">
                      姓名
                    </Label>
                    <Input
                      id="name"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      disabled={!isEditing}
                      className="border-amber-300 focus:border-amber-500 disabled:bg-amber-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-amber-700">
                      電子郵件
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      disabled={!isEditing}
                      className="border-amber-300 focus:border-amber-500 disabled:bg-amber-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-amber-700">
                      手機號碼
                    </Label>
                    <Input
                      id="phone"
                      value={user.phone}
                      onChange={(e) => setUser({ ...user, phone: e.target.value })}
                      disabled={!isEditing}
                      className="border-amber-300 focus:border-amber-500 disabled:bg-amber-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-amber-700">
                      生日
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={user.birthDate}
                      onChange={(e) => setUser({ ...user, birthDate: e.target.value })}
                      disabled={!isEditing}
                      className="border-amber-300 focus:border-amber-500 disabled:bg-amber-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-amber-700">
                      性別
                    </Label>
                    <Select
                      value={user.gender}
                      onValueChange={(value) => setUser({ ...user, gender: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="border-amber-300 focus:border-amber-500 disabled:bg-amber-50">
                        <SelectValue placeholder="選擇性別" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="男">男</SelectItem>
                        <SelectItem value="女">女</SelectItem>
                        <SelectItem value="其他">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-amber-700">
                    地址
                  </Label>
                  <Input
                    id="address"
                    value={user.address}
                    onChange={(e) => setUser({ ...user, address: e.target.value })}
                    disabled={!isEditing}
                    className="border-amber-300 focus:border-amber-500 disabled:bg-amber-50"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment">
            <div className="space-y-6">
              <Card className="border-amber-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-amber-800">付款方式</CardTitle>
                      <CardDescription className="text-amber-600">管理您的信用卡和付款資訊</CardDescription>
                    </div>
                    <Button onClick={() => setShowAddCard(true)} className="bg-amber-600 hover:bg-amber-700">
                      <Plus className="h-4 w-4 mr-2" />
                      新增卡片
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {cards.length === 0 ? (
                    <div className="text-center py-8 text-amber-600">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-amber-400" />
                      <p>尚未添加任何付款方式</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {cards.map((card) => (
                        <div
                          key={card.id}
                          className="flex items-center justify-between p-4 border border-amber-200 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white"
                        >
                          <div className="flex items-center space-x-4">
                            <CreditCard className="h-8 w-8" />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold">{card.type}</span>
                                <span>•••• {card.lastFour}</span>
                                {card.isDefault && <Badge className="bg-white text-amber-600 text-xs">預設</Badge>}
                              </div>
                              <div className="text-sm text-amber-100">
                                {card.holderName} • {card.expiryMonth}/{card.expiryYear}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {!card.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefaultCard(card.id)}
                                className="text-white hover:bg-white/20"
                              >
                                <Shield className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCard(card.id)}
                              className="text-white hover:bg-white/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add Card Form */}
              {showAddCard && (
                <Card className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-amber-800">新增信用卡</CardTitle>
                    <CardDescription className="text-amber-600">請輸入您的信用卡資訊</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-amber-700">
                        卡號
                      </Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={newCard.number}
                        onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                        className="border-amber-300 focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryMonth" className="text-amber-700">
                          月
                        </Label>
                        <Input
                          id="expiryMonth"
                          placeholder="MM"
                          value={newCard.expiryMonth}
                          onChange={(e) => setNewCard({ ...newCard, expiryMonth: e.target.value })}
                          className="border-amber-300 focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryYear" className="text-amber-700">
                          年
                        </Label>
                        <Input
                          id="expiryYear"
                          placeholder="YYYY"
                          value={newCard.expiryYear}
                          onChange={(e) => setNewCard({ ...newCard, expiryYear: e.target.value })}
                          className="border-amber-300 focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-amber-700">
                          CVV
                        </Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={newCard.cvv}
                          onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                          className="border-amber-300 focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="holderName" className="text-amber-700">
                        持卡人姓名
                      </Label>
                      <Input
                        id="holderName"
                        placeholder="WANG XIAO MING"
                        value={newCard.holderName}
                        onChange={(e) => setNewCard({ ...newCard, holderName: e.target.value })}
                        className="border-amber-300 focus:border-amber-500"
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button onClick={handleAddCard} className="bg-amber-600 hover:bg-amber-700">
                        添加卡片
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddCard(false)}
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        取消
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  我的訂單
                </CardTitle>
                <CardDescription className="text-amber-600">查看您的訂單歷史和狀態</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Package className="h-16 w-16 mx-auto text-amber-300 mb-4" />
                <h3 className="text-lg font-medium text-amber-800 mb-2">查看完整訂單列表</h3>
                <p className="text-amber-600 mb-4">點擊下方按鈕查看您的所有訂單</p>
                <Link href="/orders">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    <Package className="h-4 w-4 mr-2" />
                    查看所有訂單
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </UserGuard>
  )
}
