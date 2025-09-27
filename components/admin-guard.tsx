"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Loader2 } from "lucide-react"

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 检查管理员会话
    const adminSession = localStorage.getItem("admin_session")
    const adminUser = localStorage.getItem("admin_user")

    if (adminSession === "true" && adminUser) {
      try {
        const user = JSON.parse(adminUser)
        if (user.role === 'admin') {
          setIsAdmin(true)
        } else {
          // 清除无效会话
          localStorage.removeItem("admin_session")
          localStorage.removeItem("admin_user")
          router.push("/admin/login")
        }
      } catch (error) {
        // 清除无效会话
        localStorage.removeItem("admin_session")
        localStorage.removeItem("admin_user")
        router.push("/admin/login")
      }
    } else {
      router.push("/admin/login")
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
              <h2 className="text-xl font-semibold mb-2">驗證權限中...</h2>
              <p className="text-gray-600">正在檢查管理員權限</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">權限不足</h2>
              <p className="text-gray-600 mb-4">您沒有訪問管理後台的權限</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}


