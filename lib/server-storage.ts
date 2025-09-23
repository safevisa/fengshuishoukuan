// 服务器端数据存储 - 解决数据一致性问题
import { User, Order, Payment, Withdrawal, FinancialReport } from './types'

// 模拟服务器端数据库
class ServerStorage {
  private users: Map<string, User> = new Map()
  private orders: Map<string, Order> = new Map()
  private payments: Map<string, Payment> = new Map()
  private withdrawals: Map<string, Withdrawal> = new Map()

  constructor() {
    // 初始化默认管理员用户
    this.initializeDefaultUsers()
  }

  private initializeDefaultUsers() {
    const adminUser: User = {
      id: '1',
      name: 'Admin User',
      email: 'admin@jinshiying.com',
      phone: '+852 12345678',
      password: 'admin123',
      role: 'admin',
      userType: 'admin_created',
      status: 'active',
      balance: 0,
      createdAt: new Date('2025-09-22T13:00:00Z')
    }

    const testUser: User = {
      id: '2',
      name: '测试用户',
      email: 'test@jinshiying.com',
      phone: '+852 98765432',
      password: 'test123',
      role: 'user',
      userType: 'admin_created',
      status: 'active',
      balance: 0,
      createdAt: new Date('2025-09-22T13:00:00Z')
    }

    this.users.set(adminUser.id, adminUser)
    this.users.set(testUser.id, testUser)
  }

  // 用户管理
  addUser(user: User): void {
    this.users.set(user.id, user)
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id)
  }

  getUserByEmail(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user
      }
    }
    return undefined
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values())
  }

  updateUser(id: string, updates: Partial<User>): boolean {
    const user = this.users.get(id)
    if (user) {
      this.users.set(id, { ...user, ...updates })
      return true
    }
    return false
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id)
  }

  // 订单管理
  addOrder(order: Order): void {
    this.orders.set(order.id, order)
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.get(id)
  }

  getAllOrders(): Order[] {
    return Array.from(this.orders.values())
  }

  // 支付管理
  addPayment(payment: Payment): void {
    this.payments.set(payment.id, payment)
  }

  getPaymentById(id: string): Payment | undefined {
    return this.payments.get(id)
  }

  getAllPayments(): Payment[] {
    return Array.from(this.payments.values())
  }

  // 提现管理
  addWithdrawal(withdrawal: Withdrawal): void {
    this.withdrawals.set(withdrawal.id, withdrawal)
  }

  getWithdrawalById(id: string): Withdrawal | undefined {
    return this.withdrawals.get(id)
  }

  getAllWithdrawals(): Withdrawal[] {
    return Array.from(this.withdrawals.values())
  }

  // 财务报表
  generateFinancialReport(): FinancialReport {
    const totalOrders = this.orders.size
    const totalRevenue = Array.from(this.orders.values())
      .reduce((sum, order) => sum + order.totalAmount, 0)
    
    const platformFee = totalRevenue * 0.05 // 5% 平台费用
    const netProfit = totalRevenue - platformFee

    return {
      totalRevenue,
      totalOrders,
      platformFee,
      netProfit,
      generatedAt: new Date()
    }
  }

  // 数据导出
  exportAllData() {
    return {
      users: this.getAllUsers(),
      orders: this.getAllOrders(),
      payments: this.getAllPayments(),
      withdrawals: this.getAllWithdrawals(),
      financialReport: this.generateFinancialReport(),
      exportedAt: new Date()
    }
  }

  // 数据导入
  importData(data: any) {
    if (data.users) {
      data.users.forEach((user: User) => this.users.set(user.id, user))
    }
    if (data.orders) {
      data.orders.forEach((order: Order) => this.orders.set(order.id, order))
    }
    if (data.payments) {
      data.payments.forEach((payment: Payment) => this.payments.set(payment.id, payment))
    }
    if (data.withdrawals) {
      data.withdrawals.forEach((withdrawal: Withdrawal) => this.withdrawals.set(withdrawal.id, withdrawal))
    }
  }
}

// 创建全局实例
export const serverStorage = new ServerStorage()

// API 接口
export const serverAPI = {
  // 用户相关
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // 检查邮箱是否已存在
      const existingUser = serverStorage.getUserByEmail(userData.email)
      if (existingUser) {
        return { success: false, message: '此電子郵件已被使用' }
      }

      const newUser: User = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date()
      }

      serverStorage.addUser(newUser)
      return { success: true, message: '用戶創建成功', user: newUser }
    } catch (error) {
      return { success: false, message: '創建用戶失敗' }
    }
  },

  async loginUser(email: string, password: string): Promise<{ success: boolean; message: string; user?: Omit<User, 'password'> }> {
    try {
      const user = serverStorage.getUserByEmail(email)
      if (!user || user.password !== password) {
        return { success: false, message: '電子郵件或密碼錯誤，請重試' }
      }

      const { password: _, ...userWithoutPassword } = user
      return { success: true, message: '登入成功！歡迎回來！', user: userWithoutPassword }
    } catch (error) {
      return { success: false, message: '登入失敗' }
    }
  },

  async getAllUsers(): Promise<User[]> {
    return serverStorage.getAllUsers()
  },

  async getUserById(id: string): Promise<User | undefined> {
    return serverStorage.getUserById(id)
  },

  // 订单相关
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string; order?: Order }> {
    try {
      const newOrder: Order = {
        id: `order_${Date.now()}`,
        ...orderData,
        createdAt: new Date()
      }

      serverStorage.addOrder(newOrder)
      return { success: true, message: '訂單創建成功', order: newOrder }
    } catch (error) {
      return { success: false, message: '創建訂單失敗' }
    }
  },

  async getAllOrders(): Promise<Order[]> {
    return serverStorage.getAllOrders()
  },

  // 支付相关
  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string; payment?: Payment }> {
    try {
      const newPayment: Payment = {
        id: `payment_${Date.now()}`,
        ...paymentData,
        createdAt: new Date()
      }

      serverStorage.addPayment(newPayment)
      return { success: true, message: '支付記錄創建成功', payment: newPayment }
    } catch (error) {
      return { success: false, message: '創建支付記錄失敗' }
    }
  },

  async getAllPayments(): Promise<Payment[]> {
    return serverStorage.getAllPayments()
  },

  // 财务报表
  async getFinancialReport(): Promise<FinancialReport> {
    return serverStorage.generateFinancialReport()
  },

  // 数据导出
  async exportData(): Promise<any> {
    return serverStorage.exportAllData()
  }
}

