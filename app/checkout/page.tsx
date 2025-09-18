"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Phone, Mail, CreditCard, MapPin, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"

// Mock cart items
const mockCartItems = [
  {
    id: 1,
    name: "招財貔貅擺件",
    price: 3800,
    image: "/golden-pixiu-feng-shui-ornament.jpg",
    quantity: 2,
  },
  {
    id: 2,
    name: "紫水晶洞",
    price: 8800,
    image: "/amethyst-geode-feng-shui-crystal.jpg",
    quantity: 1,
  },
]

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

export default function CheckoutPage() {
  const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Review
  const [shippingAddress, setShippingAddress] = useState({
    name: "王小明",
    phone: "+886 912345678",
    email: "wang@example.com",
    address: "台北市信義區信義路五段7號",
    city: "台北市",
    district: "信義區",
    postalCode: "110",
  })
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [selectedCard, setSelectedCard] = useState("1")
  const [newCard, setNewCard] = useState({
    number: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    holderName: "",
  })
  const [useNewCard, setUseNewCard] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const subtotal = mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 200
  const total = subtotal + shipping

  const handlePlaceOrder = async () => {
    if (!agreeTerms) {
      alert("請同意服務條款")
      return
    }

    setIsProcessing(true)

    // Simulate order processing
    setTimeout(() => {
      setIsProcessing(false)
      alert("訂單已成功提交！您將收到確認郵件。")
      // In a real app, redirect to order confirmation page
    }, 2000)
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber ? "bg-amber-600 text-white" : "bg-amber-200 text-amber-600"
              }`}
            >
              {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
            </div>
            {stepNumber < 3 && (
              <div className={`w-12 h-0.5 mx-2 ${step > stepNumber ? "bg-amber-600" : "bg-amber-200"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderAddressStep = () => (
    <div className="space-y-6">
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-800 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            收貨地址
          </CardTitle>
          <CardDescription className="text-amber-600">請填寫您的收貨資訊</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-amber-700">
                收件人姓名
              </Label>
              <Input
                id="name"
                value={shippingAddress.name}
                onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                className="border-amber-300 focus:border-amber-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-amber-700">
                手機號碼
              </Label>
              <Input
                id="phone"
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                className="border-amber-300 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-amber-700">
              電子郵件
            </Label>
            <Input
              id="email"
              type="email"
              value={shippingAddress.email}
              onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
              className="border-amber-300 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-amber-700">
                城市
              </Label>
              <Select
                value={shippingAddress.city}
                onValueChange={(value) => setShippingAddress({ ...shippingAddress, city: value })}
              >
                <SelectTrigger className="border-amber-300 focus:border-amber-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="台北市">台北市</SelectItem>
                  <SelectItem value="新北市">新北市</SelectItem>
                  <SelectItem value="桃園市">桃園市</SelectItem>
                  <SelectItem value="台中市">台中市</SelectItem>
                  <SelectItem value="台南市">台南市</SelectItem>
                  <SelectItem value="高雄市">高雄市</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district" className="text-amber-700">
                區域
              </Label>
              <Input
                id="district"
                value={shippingAddress.district}
                onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                className="border-amber-300 focus:border-amber-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-amber-700">
                郵遞區號
              </Label>
              <Input
                id="postalCode"
                value={shippingAddress.postalCode}
                onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                className="border-amber-300 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-amber-700">
              詳細地址
            </Label>
            <Input
              id="address"
              value={shippingAddress.address}
              onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
              className="border-amber-300 focus:border-amber-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => setStep(2)} className="bg-amber-600 hover:bg-amber-700">
          下一步：選擇付款方式
        </Button>
      </div>
    </div>
  )

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-800 flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            付款方式
          </CardTitle>
          <CardDescription className="text-amber-600">選擇您的付款方式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="text-amber-700">
                信用卡
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bank" id="bank" />
              <Label htmlFor="bank" className="text-amber-700">
                銀行轉帳
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cod" id="cod" />
              <Label htmlFor="cod" className="text-amber-700">
                貨到付款
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "card" && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useNewCard"
                  checked={useNewCard}
                  onCheckedChange={(checked) => setUseNewCard(checked as boolean)}
                />
                <Label htmlFor="useNewCard" className="text-amber-700">
                  使用新的信用卡
                </Label>
              </div>

              {!useNewCard ? (
                <div className="space-y-3">
                  <Label className="text-amber-700">選擇信用卡</Label>
                  <RadioGroup value={selectedCard} onValueChange={setSelectedCard}>
                    {mockCards.map((card) => (
                      <div key={card.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={card.id.toString()} id={`card-${card.id}`} />
                        <Label htmlFor={`card-${card.id}`} className="flex items-center space-x-3 cursor-pointer">
                          <div className="flex items-center space-x-2 p-3 border border-amber-200 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white">
                            <CreditCard className="h-5 w-5" />
                            <span>
                              {card.type} •••• {card.lastFour}
                            </span>
                            {card.isDefault && <Badge className="bg-white text-amber-600 text-xs">預設</Badge>}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ) : (
                <div className="space-y-4">
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
                </div>
              )}
            </div>
          )}

          {paymentMethod === "bank" && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-800 mb-2">銀行轉帳資訊</h4>
              <div className="text-sm text-amber-700 space-y-1">
                <p>銀行：台灣銀行</p>
                <p>戶名：香港京世盈有限公司</p>
                <p>帳號：123-456-789-012</p>
                <p className="text-amber-600 mt-2">請於轉帳後將收據傳送至 service@crf.hk</p>
              </div>
            </div>
          )}

          {paymentMethod === "cod" && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-800 mb-2">貨到付款</h4>
              <p className="text-sm text-amber-700">商品送達時以現金付款，另收取手續費 NT$ 30</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          上一步
        </Button>
        <Button onClick={() => setStep(3)} className="bg-amber-600 hover:bg-amber-700">
          下一步：確認訂單
        </Button>
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-800">訂單確認</CardTitle>
          <CardDescription className="text-amber-600">請確認您的訂單資訊</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Items */}
          <div>
            <h4 className="font-medium text-amber-800 mb-3">商品清單</h4>
            <div className="space-y-3">
              {mockCartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-amber-800">{item.name}</h5>
                    <p className="text-sm text-amber-600">數量: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-amber-800">NT$ {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Shipping Address */}
          <div>
            <h4 className="font-medium text-amber-800 mb-3">收貨地址</h4>
            <div className="text-sm text-amber-700 space-y-1">
              <p>{shippingAddress.name}</p>
              <p>{shippingAddress.phone}</p>
              <p>{shippingAddress.email}</p>
              <p>
                {shippingAddress.city} {shippingAddress.district} {shippingAddress.address}
              </p>
              <p>{shippingAddress.postalCode}</p>
            </div>
          </div>

          <Separator />

          {/* Payment Method */}
          <div>
            <h4 className="font-medium text-amber-800 mb-3">付款方式</h4>
            <div className="text-sm text-amber-700">
              {paymentMethod === "card" && (
                <p>
                  信用卡{" "}
                  {!useNewCard &&
                    `(${mockCards.find((c) => c.id.toString() === selectedCard)?.type} •••• ${mockCards.find((c) => c.id.toString() === selectedCard)?.lastFour})`}
                </p>
              )}
              {paymentMethod === "bank" && <p>銀行轉帳</p>}
              {paymentMethod === "cod" && <p>貨到付款</p>}
            </div>
          </div>

          <Separator />

          {/* Terms */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
              className="border-amber-300 data-[state=checked]:bg-amber-600"
            />
            <Label htmlFor="terms" className="text-sm text-amber-700">
              我同意{" "}
              <Link href="/terms" className="text-amber-600 hover:text-amber-700 hover:underline">
                服務條款
              </Link>{" "}
              和{" "}
              <Link href="/privacy" className="text-amber-600 hover:text-amber-700 hover:underline">
                隱私政策
              </Link>
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(2)}
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          上一步
        </Button>
        <Button onClick={handlePlaceOrder} disabled={isProcessing} className="bg-amber-600 hover:bg-amber-700">
          <Shield className="h-4 w-4 mr-2" />
          {isProcessing ? "處理中..." : `確認付款 NT$ ${total.toLocaleString()}`}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/cart" className="flex items-center space-x-4">
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
          <h1 className="text-3xl font-bold text-amber-800 mb-2">結帳</h1>
          <p className="text-amber-600">安全結帳流程</p>
        </div>

        {renderStepIndicator()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && renderAddressStep()}
            {step === 2 && renderPaymentStep()}
            {step === 3 && renderReviewStep()}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="border-amber-200 sticky top-4">
              <CardHeader>
                <CardTitle className="text-amber-800">訂單摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-amber-700">商品小計</span>
                  <span className="font-medium">NT$ {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-amber-700">運費</span>
                  <span className="font-medium">NT$ {shipping.toLocaleString()}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold text-amber-800">
                  <span>總計</span>
                  <span>NT$ {total.toLocaleString()}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-amber-600">
                  <Shield className="h-4 w-4" />
                  <span>SSL 安全加密</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
