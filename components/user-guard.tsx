"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { User, Loader2 } from "lucide-react"

interface UserGuardProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function UserGuard({ children, requiredRole }: UserGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 检查用户会话
    const checkAuth = () => {
      const userData = localStorage.getItem("user")
      const isLoggedInFlag = localStorage.getItem("isLoggedIn")
      
      if (userData && isLoggedInFlag === "true") {
        try {
          const user = JSON.parse(userData)
          console.log('🔍 [UserGuard] 检查用户:', user)
          
          // 检查用户角色 - 商户和管理员可以访问工作台
          if (user.role === 'merchant' || user.role === 'admin' || (requiredRole && user.role === requiredRole)) {
            setIsLoggedIn(true)
          } else {
            console.log('❌ [UserGuard] 用户角色不匹配:', user.role, '需要:', requiredRole)
            setIsLoggedIn(false)
            router.push("/")
          }
        } catch (error) {
          console.error("Failed to parse user data:", error)
          setIsLoggedIn(false)
          router.push("/auth/login")
        }
      } else {
        console.log('❌ [UserGuard] 用户未登录或数据无效')
        // 清除无效的会话数据
        localStorage.removeItem("user")
        localStorage.removeItem("isLoggedIn")
        router.push("/auth/login")
      }
      setIsLoading(false)
    }

    // 延迟检查，确保localStorage已经设置
    const timer = setTimeout(checkAuth, 100)
    
    return () => clearTimeout(timer)
  }, [router, requiredRole])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold mb-2">驗證中...</h2>
              <p className="text-gray-600">正在檢查登入狀態</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">請先登入</h2>
              <p className="text-gray-600 mb-4">您需要登入才能訪問此頁面</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
