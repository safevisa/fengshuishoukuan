import { dataStorage } from './storage'

interface User {
  id: string
  name: string
  email: string
  phone: string
  password: string
  role: 'admin' | 'user'
  userType: 'registered' | 'admin_created' // 用户类型：注册用户 vs 管理员创建的用户
  createdAt: Date
}

export const authService = {
  // Register a new user
  register: async (userData: {
    name: string
    email: string
    phone: string
    password: string
  }): Promise<{ success: boolean; message: string }> => {
    // Check if user already exists
    const existingUser = dataStorage.getUserByEmail(userData.email)
    if (existingUser) {
      return { success: false, message: '此電子郵件已被註冊' }
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      role: 'user', // 默认角色为普通用户
      userType: 'registered', // 注册用户类型
      createdAt: new Date()
    }

    dataStorage.addUser(newUser)

    return { success: true, message: '註冊成功！歡迎加入京世盈風水！' }
  },

  // Login user
  login: async (email: string, password: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'password'> }> => {
    const users = dataStorage.getAllUsers()
    const user = users.find(u => u.email === email && u.password === password)
    
    if (!user) {
      return { success: false, message: '電子郵件或密碼錯誤，請重試' }
    }

    // Store current user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('current_user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        userType: user.userType,
        createdAt: user.createdAt
      }))
      localStorage.setItem('current_user_email', user.email)
    }

    return { 
      success: true, 
      message: '登入成功！歡迎回來！',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        userType: user.userType,
        createdAt: user.createdAt
      }
    }
  },

  // Get current user
  getCurrentUser: (): Omit<User, 'password'> | null => {
    if (typeof window === 'undefined') return null
    
    const currentUser = localStorage.getItem('current_user')
    return currentUser ? JSON.parse(currentUser) : null
  },

  // Logout user
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('current_user')
      localStorage.removeItem('current_user_email')
    }
  },

  // 管理员创建用户（具有工作台权限）
  createUserByAdmin: async (userData: {
    name: string
    email: string
    phone: string
    password: string
    role: 'admin' | 'user'
  }): Promise<{ success: boolean; message: string }> => {
    // 检查用户是否已存在
    const existingUser = dataStorage.getUserByEmail(userData.email)
    if (existingUser) {
      return { success: false, message: '此電子郵件已被使用' }
    }

    // 创建新用户（管理员创建类型）
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      userType: 'admin_created', // 管理员创建的用户类型
      createdAt: new Date()
    }

    dataStorage.addUser(newUser)

    return { success: true, message: '用戶創建成功！該用戶具有工作台訪問權限。' }
  },

  // 获取所有用户（管理员用）
  getAllUsers: (): Omit<User, 'password'>[] => {
    const users = dataStorage.getAllUsers()
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      userType: user.userType,
      createdAt: user.createdAt
    }))
  },

  // 刷新用户数据
  refreshUsers: (): void => {
    dataStorage.refresh()
  }
}

