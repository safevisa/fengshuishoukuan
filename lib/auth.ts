import { serverAPI } from './server-storage'
import { productionDB } from './production-database'

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
      // 从服务器验证用户是否存在
      const serverUser = await serverAPI.getUserById(user.id)
      if (serverUser) {
        // 更新本地用户信息
        this.setCurrentUser({
          id: serverUser.id,
          name: serverUser.name,
          email: serverUser.email,
          phone: serverUser.phone,
          role: serverUser.role,
          userType: serverUser.userType,
          status: serverUser.status,
          balance: serverUser.balance,
          createdAt: serverUser.createdAt
        })
        return true
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
      // 在生产环境中使用生产数据库
      if (process.env.NODE_ENV === 'production') {
        const existingUser = await productionDB.getUserByEmail(userData.email)
        if (existingUser) {
          return { success: false, message: '此電子郵件已被註冊' }
        }

        const newUser = {
          id: Date.now().toString(),
          ...userData,
          role: 'user' as const,
          userType: 'registered' as const,
          status: 'active' as const,
          balance: 0,
          createdAt: new Date()
        }

        await productionDB.addUser(newUser)
        return { success: true, message: '註冊成功！歡迎加入京世盈風水！' }
      } else {
        // 开发环境使用原有逻辑
        const result = await serverAPI.createUser({
          ...userData,
          role: 'user',
          userType: 'registered',
          status: 'active',
          balance: 0
        })
        return result
      }
    } catch (error) {
      return { success: false, message: '註冊失敗，請重試' }
    }
  },

  // Login user
  login: async (email: string, password: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'password'> }> => {
    try {
      // 在生产环境中使用生产数据库
      if (process.env.NODE_ENV === 'production') {
        const user = await productionDB.getUserByEmail(email)
        
        if (!user || user.password !== password) {
          return { success: false, message: '電子郵件或密碼錯誤，請重試' }
        }

        if (user.status !== 'active') {
          return { success: false, message: '帳戶已被暫停，請聯繫管理員' }
        }

        const { password: _, ...userWithoutPassword } = user
        sessionManager.setCurrentUser(userWithoutPassword)
        
        return { 
          success: true, 
          message: '登入成功！歡迎回來！',
          user: userWithoutPassword
        }
      } else {
        // 开发环境使用原有逻辑
        const result = await serverAPI.loginUser(email, password)
        
        if (result.success && result.user) {
          sessionManager.setCurrentUser(result.user)
        }

        return result
      }
    } catch (error) {
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
      const result = await serverAPI.createUser({
        ...userData,
        userType: 'admin_created',
        status: 'active',
        balance: 0
      })

      return result
    } catch (error) {
      return { success: false, message: '創建用戶失敗，請重試' }
    }
  },

  // 获取所有用户（管理员功能）
  getAllUsers: async (): Promise<User[]> => {
    try {
      return await serverAPI.getAllUsers()
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