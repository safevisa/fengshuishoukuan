"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/auth"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{email?: string; password?: string; general?: string}>({})

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {}

    if (!email) {
      newErrors.email = "請輸入電子郵件"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "請輸入有效的電子郵件格式"
    }

    if (!password) {
      newErrors.password = "請輸入密碼"
    } else if (password.length < 6) {
      newErrors.password = "密碼至少需要6位字符"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const result = await authService.login(email, password)

      if (result.success && result.user) {
        // 检查用户角色
        if (result.user.role === 'admin') {
          // 设置管理员会话
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_session", "true")
            localStorage.setItem("admin_user", JSON.stringify(result.user))
          }
          alert("管理員登入成功！")
          window.location.href = "/admin"
        } else {
          setErrors({ general: "此帳戶沒有管理員權限" })
        }
      } else {
        setErrors({ general: result.message })
      }
    } catch (error) {
      setErrors({ general: "登入過程中發生錯誤，請重試" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-4">
              <ArrowLeft className="h-5 w-5 text-red-600" />
              <div className="text-2xl font-bold text-red-800">京世盈風水</div>
            </Link>

            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-700 font-medium">管理員專用</span>
            </div>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-800">管理員登入</CardTitle>
            <CardDescription className="text-red-600">
              請使用管理員帳戶登入系統後台
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {errors.general}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-red-700">
                  電子郵件
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="請輸入管理員電子郵件"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: undefined }))
                    }
                  }}
                  className={`border-red-300 focus:border-red-500 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-red-700">
                  密碼
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="請輸入管理員密碼"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: undefined }))
                      }
                    }}
                    className={`border-red-300 focus:border-red-500 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
                {isLoading ? "登入中..." : "管理員登入"}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-red-600">
                忘記密碼？請聯繫系統管理員
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
