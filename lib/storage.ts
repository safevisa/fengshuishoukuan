// 数据持久化存储服务
import { User } from './auth'

// 在浏览器环境中使用localStorage，在服务端使用内存存储
class DataStorage {
  private users: User[] = []
  private isServer = typeof window === 'undefined'

  constructor() {
    this.loadData()
  }

  private loadData(): void {
    if (this.isServer) {
      // 服务端：使用默认数据
      this.users = this.getDefaultUsers()
    } else {
      // 客户端：从localStorage加载
      const storedUsers = localStorage.getItem('fengshui_users')
      if (storedUsers) {
        try {
          this.users = JSON.parse(storedUsers).map((user: any) => ({
            ...user,
            createdAt: new Date(user.createdAt)
          }))
        } catch (error) {
          console.error('Failed to parse stored users:', error)
          this.users = this.getDefaultUsers()
          this.saveData()
        }
      } else {
        this.users = this.getDefaultUsers()
        this.saveData()
      }
    }
  }

  private saveData(): void {
    if (!this.isServer) {
      localStorage.setItem('fengshui_users', JSON.stringify(this.users))
    }
  }

  private getDefaultUsers(): User[] {
    return [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@jinshiying.com',
        phone: '+852 12345678',
        password: 'admin123456',
        role: 'admin',
        userType: 'admin_created',
        createdAt: new Date()
      },
      {
        id: '2',
        name: '测试用户',
        email: 'test@jinshiying.com',
        phone: '+852 98765432',
        password: 'test123456',
        role: 'user',
        userType: 'admin_created',
        createdAt: new Date()
      }
    ]
  }

  // 获取所有用户
  getAllUsers(): User[] {
    this.loadData() // 每次获取时重新加载确保数据最新
    return [...this.users]
  }

  // 根据邮箱查找用户
  getUserByEmail(email: string): User | undefined {
    this.loadData()
    return this.users.find(user => user.email === email)
  }

  // 根据ID查找用户
  getUserById(id: string): User | undefined {
    this.loadData()
    return this.users.find(user => user.id === id)
  }

  // 添加用户
  addUser(user: User): void {
    this.loadData()
    this.users.push(user)
    this.saveData()
  }

  // 更新用户
  updateUser(id: string, updates: Partial<User>): boolean {
    this.loadData()
    const userIndex = this.users.findIndex(user => user.id === id)
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates }
      this.saveData()
      return true
    }
    return false
  }

  // 删除用户
  deleteUser(id: string): boolean {
    this.loadData()
    const userIndex = this.users.findIndex(user => user.id === id)
    if (userIndex !== -1) {
      this.users.splice(userIndex, 1)
      this.saveData()
      return true
    }
    return false
  }

  // 刷新数据
  refresh(): void {
    this.loadData()
  }
}

// 创建全局存储实例
export const dataStorage = new DataStorage()
