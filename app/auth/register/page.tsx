"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, ArrowLeft, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/auth"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "請輸入姓名"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "姓名至少需要2個字符"
    }
    
    if (!formData.email) {
      newErrors.email = "請輸入電子郵件"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "請輸入有效的電子郵件格式"
    }
    
    if (!formData.phone) {
      newErrors.phone = "請輸入手機號碼"
    } else if (!/^[\d\-\+\(\)\s]+$/.test(formData.phone)) {
      newErrors.phone = "請輸入有效的手機號碼格式"
    }
    
    if (!formData.password) {
      newErrors.password = "請輸入密碼"
    } else if (formData.password.length < 8) {
      newErrors.password = "密碼至少需要8位字符"
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "密碼必須包含字母和數字"
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "請確認密碼"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "密碼確認不一致"
    }
    
    if (!agreeTerms) {
      newErrors.terms = "請同意服務條款和隱私政策"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await authService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })

      if (result.success) {
        alert(result.message)
        // Redirect to login page
        window.location.href = "/auth/login"
      } else {
        setErrors({ general: result.message })
      }
    } catch (error) {
      setErrors({ general: "註冊過程中發生錯誤，請重試" })
    } finally {
      setIsLoading(false)
    }
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

      {/* Register Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-amber-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-amber-800">會員註冊</CardTitle>
            <CardDescription className="text-amber-600">創建您的帳戶，開啟風水之旅</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {errors.general}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-amber-700">
                  姓名
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="請輸入您的姓名"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`border-amber-300 focus:border-amber-500 ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-amber-700">
                  電子郵件
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="請輸入您的電子郵件"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`border-amber-300 focus:border-amber-500 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-amber-700">
                  手機號碼
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="請輸入您的手機號碼"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`border-amber-300 focus:border-amber-500 ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-amber-700">
                  密碼
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="請輸入密碼（至少8位）"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={`border-amber-300 focus:border-amber-500 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-amber-500" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-amber-700">
                  確認密碼
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="請再次輸入密碼"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={`border-amber-300 focus:border-amber-500 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-amber-500" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => {
                      setAgreeTerms(checked as boolean)
                      if (errors.terms) {
                        setErrors(prev => ({ ...prev, terms: undefined }))
                      }
                    }}
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
                {errors.terms && (
                  <p className="text-red-500 text-sm">{errors.terms}</p>
                )}
              </div>

              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={isLoading}>
                {isLoading ? "註冊中..." : "註冊"}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-amber-600">
                已有帳戶？{" "}
                <Link href="/auth/login" className="font-medium text-amber-700 hover:text-amber-800 hover:underline">
                  立即登入
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
