import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { config } from '../config'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

// JWT验证中间件
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    }
  } catch (error) {
    return null
  }
}

// 认证中间件
export function withAuth(handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '')
      
      if (!token) {
        return NextResponse.json(
          { success: false, error: '未提供认证令牌' },
          { status: 401 }
        )
      }

      const user = verifyToken(token)
      if (!user) {
        return NextResponse.json(
          { success: false, error: '无效的认证令牌' },
          { status: 401 }
        )
      }

      return handler(req, user)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '认证失败' },
        { status: 401 }
      )
    }
  }
}

// 管理员权限中间件
export function withAdminAuth(handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return withAuth(async (req: NextRequest, user: AuthUser) => {
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '需要管理员权限' },
        { status: 403 }
      )
    }
    return handler(req, user)
  })
}

// 生成JWT令牌
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  )
}

// 从请求中提取用户信息
export function getUserFromRequest(req: NextRequest): AuthUser | null {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  return verifyToken(token)
}


