"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { User, Loader2 } from "lucide-react"

interface UserGuardProps {
  children: React.ReactNode
}

export default function UserGuard({ children }: UserGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 检查用户会话
    const checkAuth = () => {
      const currentUserEmail = localStorage.getItem("current_user_email")
      const currentUser = localStorage.getItem("current_user")
      
      if (currentUserEmail && currentUser) {
        try {
          const userData = JSON.parse(currentUser)
          // 检查用户类型，只有管理员创建的用户才能访问工作台
          if (userData.userType === 'admin_created') {
            setIsLoggedIn(true)
          } else {
            // 注册用户无权访问工作台
            setIsLoggedIn(false)
            router.push("/")
          }
        } catch (error) {
          console.error("Failed to parse user data:", error)
          setIsLoggedIn(false)
          router.push("/auth/login")
        }
      } else {
        // 清除无效的会话数据
        localStorage.removeItem("current_user_email")
        localStorage.removeItem("current_user")
        router.push("/auth/login")
      }
      setIsLoading(false)
    }

    // 延迟检查，确保localStorage已经设置
    const timer = setTimeout(checkAuth, 100)
    
    return () => clearTimeout(timer)
  }, [router])

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
