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
    const currentUserEmail = localStorage.getItem("current_user_email")
    
    if (currentUserEmail) {
      setIsLoggedIn(true)
    } else {
      router.push("/auth/login")
    }

    setIsLoading(false)
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
