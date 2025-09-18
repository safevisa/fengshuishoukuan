"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Phone, Mail, Plus, Minus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"

// Mock cart items
const mockCartItems = [
  {
    id: 1,
    productId: 1,
    name: "招財貔貅擺件",
    price: 3800,
    originalPrice: 4500,
    image: "/golden-pixiu-feng-shui-ornament.jpg",
    category: "招財",
    quantity: 2,
  },
  {
    id: 2,
    productId: 4,
    name: "紫水晶洞",
    price: 8800,
    originalPrice: 10000,
    image: "/amethyst-geode-feng-shui-crystal.jpg",
    category: "招財",
    quantity: 1,
  },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(mockCartItems)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }
    setCartItems((items) => items.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (itemId: number) => {
    setCartItems((items) => items.filter((item) => item.id !== itemId))
  }

  const applyPromoCode = () => {
    if (promoCode === "WELCOME10") {
      setDiscount(0.1) // 10% discount
      alert("優惠碼已套用！享受10%折扣")
    } else if (promoCode === "FENGSHUI20") {
      setDiscount(0.2) // 20% discount
      alert("優惠碼已套用！享受20%折扣")
    } else {
      alert("無效的優惠碼")
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = subtotal * discount
  const shipping = subtotal > 5000 ? 0 : 200 // Free shipping over NT$5000
  const total = subtotal - discountAmount + shipping

  if (cartItems.length === 0) {
    return (
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

        {/* Empty Cart */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 mx-auto text-amber-300 mb-6" />
            <h1 className="text-3xl font-bold text-amber-800 mb-4">購物車是空的</h1>
            <p className="text-amber-600 mb-8">快去選購您喜愛的風水擺件吧！</p>
            <Link href="/">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">繼續購物</Button>
            </Link>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-amber-800 mb-2">購物車</h1>
          <p className="text-amber-600">共 {cartItems.length} 件商品</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-amber-800">{item.name}</h3>
                          <Badge className="mt-1 bg-amber-100 text-amber-700 hover:bg-amber-200">{item.category}</Badge>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-amber-700">NT$ {item.price.toLocaleString()}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                NT$ {item.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0 border-amber-300 text-amber-700 hover:bg-amber-50"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 border-amber-300 text-amber-700 hover:bg-amber-50"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold text-amber-800">
                            NT$ {(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Promo Code */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800">優惠碼</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="輸入優惠碼"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="border-amber-300 focus:border-amber-500"
                  />
                  <Button
                    onClick={applyPromoCode}
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                  >
                    套用
                  </Button>
                </div>
                <div className="text-xs text-amber-600">試試 "WELCOME10" 或 "FENGSHUI20"</div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800">訂單摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-amber-700">小計</span>
                  <span className="font-medium">NT$ {subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>優惠折扣 ({(discount * 100).toFixed(0)}%)</span>
                    <span>-NT$ {discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-amber-700">運費</span>
                  <span className="font-medium">{shipping === 0 ? "免費" : `NT$ ${shipping.toLocaleString()}`}</span>
                </div>

                {shipping > 0 && <div className="text-xs text-amber-600">滿 NT$ 5,000 免運費</div>}

                <Separator />

                <div className="flex justify-between text-lg font-bold text-amber-800">
                  <span>總計</span>
                  <span>NT$ {total.toLocaleString()}</span>
                </div>

                <Link href="/checkout">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">前往結帳</Button>
                </Link>

                <Link href="/">
                  <Button
                    variant="outline"
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                  >
                    繼續購物
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
