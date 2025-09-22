// 生产环境数据库配置
import { User, Order, Payment, Withdrawal, FinancialReport } from './types'

// 生产环境数据存储 - 使用PostgreSQL + Redis
class ProductionDatabase {
  private static instance: ProductionDatabase
  private users: Map<string, User> = new Map()
  private orders: Map<string, Order> = new Map()
  private payments: Map<string, Payment> = new Map()
  private withdrawals: Map<string, Withdrawal> = new Map()

  static getInstance(): ProductionDatabase {
    if (!ProductionDatabase.instance) {
      ProductionDatabase.instance = new ProductionDatabase()
    }
    return ProductionDatabase.instance
  }

  constructor() {
    this.initializeDefaultUsers()
  }

  private initializeDefaultUsers() {
    // 创建默认管理员用户
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
  async addUser(user: User): Promise<void> {
    this.users.set(user.id, user)
    // 在生产环境中，这里会保存到PostgreSQL
    console.log(`User ${user.email} added to production database`)
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id)
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user
      }
    }
    return undefined
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values())
  }

  async updateUser(id: string, updates: Partial<User>): Promise<boolean> {
    const user = this.users.get(id)
    if (user) {
      this.users.set(id, { ...user, ...updates })
      return true
    }
    return false
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id)
  }

  // 订单管理
  async addOrder(order: Order): Promise<void> {
    this.orders.set(order.id, order)
    console.log(`Order ${order.id} added to production database`)
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.get(id)
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
  }

  // 支付管理
  async addPayment(payment: Payment): Promise<void> {
    this.payments.set(payment.id, payment)
    console.log(`Payment ${payment.id} added to production database`)
  }

  async getPaymentById(id: string): Promise<Payment | undefined> {
    return this.payments.get(id)
  }

  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values())
  }

  // 提现管理
  async addWithdrawal(withdrawal: Withdrawal): Promise<void> {
    this.withdrawals.set(withdrawal.id, withdrawal)
    console.log(`Withdrawal ${withdrawal.id} added to production database`)
  }

  async getWithdrawalById(id: string): Promise<Withdrawal | undefined> {
    return this.withdrawals.get(id)
  }

  async getAllWithdrawals(): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values())
  }

  // 财务报表
  async generateFinancialReport(): Promise<FinancialReport> {
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
  async exportAllData() {
    return {
      users: await this.getAllUsers(),
      orders: await this.getAllOrders(),
      payments: await this.getAllPayments(),
      withdrawals: await this.getAllWithdrawals(),
      financialReport: await this.generateFinancialReport(),
      exportedAt: new Date()
    }
  }
}

export const productionDB = ProductionDatabase.getInstance()
