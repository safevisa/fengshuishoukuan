// 客户端安全的认证服务
// 数据库操作通过 API 路由进行

interface User {
  id: string
  name: string
  email: string
  phone: string
  password: string
  role: 'admin' | 'user'
  userType?: 'registered' | 'admin_created'
  status?: 'active' | 'inactive' | 'suspended'
  balance?: number
  createdAt: Date
}

// 会话管理 - 使用服务器端存储 + 客户端缓存
class SessionManager {
  private static instance: SessionManager
  private currentUser: Omit<User, 'password'> | null = null
  private sessionKey = 'fengshui_session'

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  // 设置当前用户会话
  setCurrentUser(user: Omit<User, 'password'>): void {
    this.currentUser = user
    if (typeof window !== 'undefined') {
      // 存储到localStorage作为缓存
      localStorage.setItem(this.sessionKey, JSON.stringify({
        user,
        timestamp: Date.now()
      }))
    }
  }

  // 获取当前用户
  getCurrentUser(): Omit<User, 'password'> | null {
    if (this.currentUser) {
      return this.currentUser
    }

    if (typeof window !== 'undefined') {
      try {
        const sessionData = localStorage.getItem(this.sessionKey)
        if (sessionData) {
          const { user, timestamp } = JSON.parse(sessionData)
          // 检查会话是否过期（24小时）
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            this.currentUser = user
            return user
          } else {
            // 会话过期，清除本地数据
            this.clearSession()
          }
        }
      } catch (error) {
        console.error('Error parsing session data:', error)
        this.clearSession()
      }
    }

    return null
  }

  // 清除会话
  clearSession(): void {
    this.currentUser = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.sessionKey)
    }
  }

  // 验证会话有效性
  async validateSession(): Promise<boolean> {
    const user = this.getCurrentUser()
    if (!user) return false

    try {
      // 通过 API 验证用户是否存在
      const response = await fetch(`/api/users/${user.id}`)
      if (response.ok) {
        const dbUser = await response.json()
        if (dbUser.success && dbUser.data) {
          // 更新本地用户信息
          this.setCurrentUser({
            id: dbUser.data.id,
            name: dbUser.data.name,
            email: dbUser.data.email,
            phone: dbUser.data.phone || '',
            role: dbUser.data.role,
            userType: dbUser.data.userType || 'self_registered',
            status: dbUser.data.status || 'active',
            balance: dbUser.data.balance || 0,
            createdAt: new Date(dbUser.data.createdAt)
          })
          return true
        }
      }
    } catch (error) {
      console.error('Session validation error:', error)
    }

    this.clearSession()
    return false
  }
}

const sessionManager = SessionManager.getInstance()

export const authService = {
  // Register a new user
  register: async (userData: {
    name: string
    email: string
    phone: string
    password: string
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: '註冊失敗，請重試' }
    }
  },

  // Login user
  login: async (email: string, password: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'password'> }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()
      
      if (result.success && result.user) {
        sessionManager.setCurrentUser(result.user)
      }

      return result
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: '登入失敗，請重試' }
    }
  },

  // Get current user
  getCurrentUser: (): Omit<User, 'password'> | null => {
    return sessionManager.getCurrentUser()
  },

  // Logout user
  logout: (): void => {
    sessionManager.clearSession()
  },

  // 管理员创建用户（具有工作台权限）
  createUserByAdmin: async (userData: {
    name: string
    email: string
    phone: string
    password: string
    role: 'admin' | 'user'
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Create user error:', error)
      return { success: false, message: '創建用戶失敗，請重試' }
    }
  },

  // 获取所有用户（管理员功能）
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const result = await response.json()
        return result.data || []
      }
      return []
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  },

  // 刷新用户数据
  refreshUsers: async (): Promise<void> => {
    try {
      // 验证当前会话
      await sessionManager.validateSession()
    } catch (error) {
      console.error('Error refreshing users:', error)
    }
  },

  // 验证会话
  validateSession: async (): Promise<boolean> => {
    return await sessionManager.validateSession()
  }
}