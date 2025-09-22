// 生产环境数据库配置
import { User, Order, Payment, Withdrawal, FinancialReport } from './types'
import fs from 'fs'
import path from 'path'

// 生产环境数据存储 - 使用文件存储
class ProductionDatabase {
  private static instance: ProductionDatabase
  private users: Map<string, User> = new Map()
  private orders: Map<string, Order> = new Map()
  private payments: Map<string, Payment> = new Map()
  private withdrawals: Map<string, Withdrawal> = new Map()
  private paymentLinks: Map<string, any> = new Map()
  private dataDir: string

  static getInstance(): ProductionDatabase {
    if (!ProductionDatabase.instance) {
      ProductionDatabase.instance = new ProductionDatabase()
    }
    return ProductionDatabase.instance
  }

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data')
    this.ensureDataDir()
    this.loadDataFromFiles()
    this.initializeDefaultUsers()
  }

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
    }
  }

  private loadDataFromFiles() {
    try {
      // 加载用户数据
      const usersFile = path.join(this.dataDir, 'users.json')
      if (fs.existsSync(usersFile)) {
        const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'))
        usersData.forEach((user: User) => {
          this.users.set(user.id, { ...user, createdAt: new Date(user.createdAt) })
        })
      }

      // 加载订单数据
      const ordersFile = path.join(this.dataDir, 'orders.json')
      if (fs.existsSync(ordersFile)) {
        const ordersData = JSON.parse(fs.readFileSync(ordersFile, 'utf8'))
        ordersData.forEach((order: Order) => {
          this.orders.set(order.id, { ...order, createdAt: new Date(order.createdAt) })
        })
      }

      // 加载支付数据
      const paymentsFile = path.join(this.dataDir, 'payments.json')
      if (fs.existsSync(paymentsFile)) {
        const paymentsData = JSON.parse(fs.readFileSync(paymentsFile, 'utf8'))
        paymentsData.forEach((payment: Payment) => {
          this.payments.set(payment.id, { ...payment, createdAt: new Date(payment.createdAt) })
        })
      }

      // 加载提现数据
      const withdrawalsFile = path.join(this.dataDir, 'withdrawals.json')
      if (fs.existsSync(withdrawalsFile)) {
        const withdrawalsData = JSON.parse(fs.readFileSync(withdrawalsFile, 'utf8'))
        withdrawalsData.forEach((withdrawal: Withdrawal) => {
          this.withdrawals.set(withdrawal.id, { ...withdrawal, createdAt: new Date(withdrawal.createdAt) })
        })
      }

      // 加载收款链接数据
      const paymentLinksFile = path.join(this.dataDir, 'payment-links.json')
      if (fs.existsSync(paymentLinksFile)) {
        const paymentLinksData = JSON.parse(fs.readFileSync(paymentLinksFile, 'utf8'))
        paymentLinksData.forEach((link: any) => {
          this.paymentLinks.set(link.id, { ...link, createdAt: new Date(link.createdAt) })
        })
      }
    } catch (error) {
      console.error('Error loading data from files:', error)
    }
  }

  private saveDataToFile(dataType: string, data: any[]) {
    try {
      const filePath = path.join(this.dataDir, `${dataType}.json`)
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error(`Error saving ${dataType} data:`, error)
    }
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
    this.saveDataToFile('users', Array.from(this.users.values()))
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
      this.saveDataToFile('users', Array.from(this.users.values()))
      return true
    }
    return false
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = this.users.delete(id)
    if (result) {
      this.saveDataToFile('users', Array.from(this.users.values()))
    }
    return result
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

  // 收款链接管理
  async addPaymentLink(linkData: any): Promise<void> {
    this.paymentLinks.set(linkData.id, linkData)
    this.saveDataToFile('payment-links', Array.from(this.paymentLinks.values()))
    console.log(`Payment link ${linkData.id} added to production database`)
  }

  async getPaymentLinkById(id: string): Promise<any | undefined> {
    return this.paymentLinks.get(id)
  }

  async getAllPaymentLinks(): Promise<any[]> {
    return Array.from(this.paymentLinks.values())
  }

  async updatePaymentLink(id: string, updates: Partial<any>): Promise<boolean> {
    const link = this.paymentLinks.get(id)
    if (link) {
      this.paymentLinks.set(id, { ...link, ...updates })
      this.saveDataToFile('payment-links', Array.from(this.paymentLinks.values()))
      return true
    }
    return false
  }

  async deletePaymentLink(id: string): Promise<boolean> {
    const result = this.paymentLinks.delete(id)
    if (result) {
      this.saveDataToFile('payment-links', Array.from(this.paymentLinks.values()))
    }
    return result
  }

  // 数据导出
  async exportAllData() {
    return {
      users: await this.getAllUsers(),
      orders: await this.getAllOrders(),
      payments: await this.getAllPayments(),
      withdrawals: await this.getAllWithdrawals(),
      paymentLinks: await this.getAllPaymentLinks(),
      financialReport: await this.generateFinancialReport(),
      exportedAt: new Date()
    }
  }
}

export const productionDB = ProductionDatabase.getInstance()
