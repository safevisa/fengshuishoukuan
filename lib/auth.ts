// Simple in-memory user storage for demo purposes
// In a real app, this would be handled by a backend API

interface User {
  id: string
  name: string
  email: string
  phone: string
  password: string
  createdAt: Date
}

// In-memory storage (will reset on page refresh in development)
let users: User[] = [
  // Default admin user
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+852 12345678',
    password: '123456',
    createdAt: new Date()
  }
]

export const authService = {
  // Register a new user
  register: async (userData: {
    name: string
    email: string
    phone: string
    password: string
  }): Promise<{ success: boolean; message: string }> => {
    // Check if user already exists
    const existingUser = users.find(user => user.email === userData.email)
    if (existingUser) {
      return { success: false, message: '此電子郵件已被註冊' }
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date()
    }

    users.push(newUser)
    
    // Store in localStorage for persistence across page refreshes
    if (typeof window !== 'undefined') {
      localStorage.setItem('fengshui_users', JSON.stringify(users))
    }

    return { success: true, message: '註冊成功！歡迎加入京世盈風水！' }
  },

  // Login user
  login: async (email: string, password: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'password'> }> => {
    // Load users from localStorage if available
    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem('fengshui_users')
      if (storedUsers) {
        users = JSON.parse(storedUsers).map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt)
        }))
      }
    }

    const user = users.find(u => u.email === email && u.password === password)
    
    if (!user) {
      return { success: false, message: '電子郵件或密碼錯誤，請重試' }
    }

    // Store current user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('fengshui_current_user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
      }))
    }

    return { 
      success: true, 
      message: '登入成功！歡迎回來！',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
      }
    }
  },

  // Get current user
  getCurrentUser: (): Omit<User, 'password'> | null => {
    if (typeof window === 'undefined') return null
    
    const currentUser = localStorage.getItem('fengshui_current_user')
    return currentUser ? JSON.parse(currentUser) : null
  },

  // Logout user
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fengshui_current_user')
    }
  }
}

