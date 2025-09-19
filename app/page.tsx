"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart, User, Phone, Mail, Shield, Truck, FileText, BarChart3, LogOut } from "lucide-react"
import Link from "next/link"

// Mock product data for feng shui items
const products = [
  {
    id: 1,
    name: "招財貔貅擺件",
    price: 3800,
    originalPrice: 4500,
    image: "/golden-pixiu-feng-shui-ornament.jpg",
    category: "招財",
    description: "純銅打造，開光加持，助您財運亨通",
    isHot: true,
  },
  {
    id: 2,
    name: "水晶龍龜",
    price: 2800,
    originalPrice: 3200,
    image: "/crystal-dragon-turtle-feng-shui.jpg",
    category: "化煞",
    description: "天然水晶雕刻，化煞擋災，保家宅平安",
    isNew: true,
  },
  {
    id: 3,
    name: "五帝錢掛飾",
    price: 1200,
    originalPrice: 1500,
    image: "/five-emperor-coins-feng-shui-charm.jpg",
    category: "辟邪",
    description: "清朝五帝錢，辟邪化煞，增強運勢",
  },
  {
    id: 4,
    name: "紫水晶洞",
    price: 8800,
    originalPrice: 10000,
    image: "/amethyst-geode-feng-shui-crystal.jpg",
    category: "招財",
    description: "巴西紫水晶洞，淨化磁場，招財進寶",
    isHot: true,
  },
  {
    id: 5,
    name: "觀音蓮花座",
    price: 5600,
    originalPrice: 6800,
    image: "/guanyin-lotus-feng-shui-statue.jpg",
    category: "平安",
    description: "白玉觀音，慈悲護佑，保佑平安健康",
  },
  {
    id: 6,
    name: "風水羅盤",
    price: 2200,
    originalPrice: 2800,
    image: "/feng-shui-compass-luopan.jpg",
    category: "工具",
    description: "專業風水羅盤，精準測量，風水必備",
  },
]

const categories = ["全部", "招財", "化煞", "辟邪", "平安", "工具"]

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [searchTerm, setSearchTerm] = useState("")
  const [cartCount, setCartCount] = useState(3) // Mock cart count
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)

  // 检查登录状态
  useEffect(() => {
    const checkLoginStatus = () => {
      const currentUserEmail = localStorage.getItem("current_user_email")
      if (currentUserEmail) {
        setIsLoggedIn(true)
        // 这里可以从localStorage获取用户信息
        const userData = localStorage.getItem("current_user")
        if (userData) {
          setUser(JSON.parse(userData))
        }
      }
    }
    
    checkLoginStatus()
    // 监听storage变化
    window.addEventListener('storage', checkLoginStatus)
    return () => window.removeEventListener('storage', checkLoginStatus)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("current_user_email")
    localStorage.removeItem("current_user")
    setIsLoggedIn(false)
    setUser(null)
    window.location.reload()
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "全部" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (product: (typeof products)[0]) => {
    setCartCount((prev) => prev + 1)
    alert(`${product.name} 已加入購物車！`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200">
        {/* Main navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-amber-800">京世盈風水</div>
            </div>

            <div className="flex items-center space-x-3">
              {!isLoggedIn ? (
                <>
                  <Link href="/auth/register">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                    >
                      註冊
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                    >
                      登入
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/profile">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                    >
                      <User className="h-4 w-4 mr-2" />
                      會員中心
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      工作台
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    登出
                  </Button>
                </>
              )}
              <Link href="/cart">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white relative">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  購物車
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-600 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">開運風水 · 招財進寶</h1>
          <p className="text-xl md:text-2xl mb-8 text-amber-100 text-pretty">
            精選開光風水擺件，助您事業興旺，財源廣進
          </p>
          <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50 text-lg px-8 py-3">
            立即選購
          </Button>
        </div>
        <div className="absolute inset-0 bg-black/10"></div>
      </section>

      {/* Search and Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 h-4 w-4" />
            <Input
              placeholder="搜尋風水擺件..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-amber-300 focus:border-amber-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "border-amber-300 text-amber-700 hover:bg-amber-50"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-lg transition-shadow border-amber-200 hover:border-amber-300"
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex gap-2">
                    {product.isHot && <Badge className="bg-red-500 hover:bg-red-600 text-white">熱銷</Badge>}
                    {product.isNew && <Badge className="bg-green-500 hover:bg-green-600 text-white">新品</Badge>}
                  </div>
                  <Badge className="absolute top-2 right-2 bg-amber-600 hover:bg-amber-700 text-white">
                    {product.category}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2 text-amber-800">{product.name}</CardTitle>
                <CardDescription className="text-amber-600 mb-3">{product.description}</CardDescription>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-amber-700">NT$ {product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      NT$ {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  加入購物車
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">香港京世盈有限公司</h3>
              <p className="text-amber-200 mb-2">專業風水擺件供應商</p>
              <p className="text-amber-200">為您帶來好運與財富</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">聯絡資訊</h3>
              <div className="space-y-2 text-amber-200">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+852 61588111</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>service@crf.hk</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">服務承諾</h3>
              <ul className="space-y-2 text-amber-200">
                <li>• 正品保證</li>
                <li>• 開光加持</li>
                <li>• 全台配送</li>
                <li>• 專業諮詢</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">法律條款</h3>
              <ul className="space-y-2 text-amber-200">
                <li>
                  <Link href="/privacy" className="flex items-center space-x-2 hover:text-white transition-colors">
                    <Shield className="h-4 w-4" />
                    <span>隱私授權</span>
                  </Link>
                </li>
                <li>
                  <Link href="/data-policy" className="flex items-center space-x-2 hover:text-white transition-colors">
                    <FileText className="h-4 w-4" />
                    <span>數據授權</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/shipping-returns"
                    className="flex items-center space-x-2 hover:text-white transition-colors"
                  >
                    <Truck className="h-4 w-4" />
                    <span>物流及退貨規則</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-amber-700 mt-8 pt-8 text-center text-amber-200">
            <p>&copy; 2024 香港京世盈有限公司 版權所有</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
