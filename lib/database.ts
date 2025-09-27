import { 
  User, 
  Order, 
  Payment, 
  Withdrawal, 
  FinancialReport, 
  FeeRule, 
  PaymentLink,
  PaymentMethod,
  OrderStatus 
} from './types';

// 模拟数据库存储
class Database {
  private users: Map<string, User> = new Map();
  private orders: Map<string, Order> = new Map();
  private payments: Map<string, Payment> = new Map();
  private withdrawals: Map<string, Withdrawal> = new Map();
  private financialReports: Map<string, FinancialReport> = new Map();
  private feeRules: Map<string, FeeRule> = new Map();
  private paymentLinks: Map<string, PaymentLink> = new Map();
  private paymentMethods: Map<string, PaymentMethod> = new Map();

  constructor() {
    this.loadData(); // 先加载已保存的数据
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // 初始化默认管理员
    const adminUser: User = {
      id: 'admin-001',
      name: '系统管理员',
      email: 'admin@jinshiying.com',
      phone: '+852-61588111',
      password: 'admin123456',
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      balance: 0,
      totalEarnings: 0,
      totalWithdrawals: 0
    };
    this.users.set(adminUser.id, adminUser);

    // 初始化支付方式
    const paymentMethods: PaymentMethod[] = [
      {
        id: 'jkopay-001',
        name: '街口支付',
        type: 'jkopay',
        config: {
          merchantId: process.env.JKOPAY_MERCHANT_ID || '',
          apiKey: process.env.JKOPAY_API_KEY || '',
          secretKey: process.env.JKOPAY_SECRET_KEY || '',
          apiUrl: process.env.JKOPAY_API_URL || 'https://api.jkopay.com',
          returnUrl: process.env.JKOPAY_RETURN_URL || 'https://jinshiying.com/payment/return',
          notifyUrl: process.env.JKOPAY_NOTIFY_URL || 'https://jinshiying.com/api/payment/notify'
        },
        isActive: true,
        feeRate: 0.015 // 1.5%
      },
      {
        id: 'alipay-001',
        name: '支付宝',
        type: 'alipay',
        config: {
          appId: process.env.ALIPAY_APP_ID || '',
          privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
          publicKey: process.env.ALIPAY_PUBLIC_KEY || ''
        },
        isActive: true,
        feeRate: 0.006 // 0.6%
      },
      {
        id: 'wechat-001',
        name: '微信支付',
        type: 'wechat',
        config: {
          appId: process.env.WECHAT_APP_ID || '',
          mchId: process.env.WECHAT_MCH_ID || '',
          apiKey: process.env.WECHAT_API_KEY || ''
        },
        isActive: true,
        feeRate: 0.006 // 0.6%
      },
      {
        id: 'stripe-001',
        name: 'Stripe',
        type: 'stripe',
        config: {
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
          secretKey: process.env.STRIPE_SECRET_KEY || ''
        },
        isActive: true,
        feeRate: 0.029 + 0.3 // 2.9% + $0.30
      }
    ];

    paymentMethods.forEach(method => {
      this.paymentMethods.set(method.id, method);
    });

    // 初始化扣费规则
    const feeRules: FeeRule[] = [
      {
        id: 'fee-001',
        name: '平台服务费',
        type: 'percentage',
        value: 0.05, // 5%
        minAmount: 0.01,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'fee-002',
        name: '提现手续费',
        type: 'fixed',
        value: 2.0, // $2
        minAmount: 10,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    feeRules.forEach(rule => {
      this.feeRules.set(rule.id, rule);
    });
  }

  // 用户相关
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // 订单相关
  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
    const id = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  getOrdersByUserId(userId: string): Order[] {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      status, 
      updatedAt: new Date(),
      ...(status === 'paid' && { paidAt: new Date() }),
      ...(status === 'shipped' && { shippedAt: new Date() }),
      ...(status === 'delivered' && { deliveredAt: new Date() })
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // 支付相关
  createPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Payment {
    const id = `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPayment: Payment = {
      ...payment,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  getPaymentById(id: string): Payment | undefined {
    return this.payments.get(id);
  }

  updatePaymentStatus(id: string, status: Payment['status']): Payment | undefined {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, status, updatedAt: new Date() };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // 提现相关
  createWithdrawal(withdrawal: Omit<Withdrawal, 'id' | 'createdAt' | 'updatedAt'>): Withdrawal {
    const id = `withdrawal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newWithdrawal: Withdrawal = {
      ...withdrawal,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.withdrawals.set(id, newWithdrawal);
    return newWithdrawal;
  }

  getWithdrawalById(id: string): Withdrawal | undefined {
    return this.withdrawals.get(id);
  }

  getWithdrawalsByUserId(userId: string): Withdrawal[] {
    return Array.from(this.withdrawals.values()).filter(w => w.userId === userId);
  }

  updateWithdrawalStatus(id: string, status: Withdrawal['status']): Withdrawal | undefined {
    const withdrawal = this.withdrawals.get(id);
    if (!withdrawal) return undefined;
    
    const updatedWithdrawal = { 
      ...withdrawal, 
      status, 
      updatedAt: new Date(),
      ...(status === 'completed' && { processedAt: new Date() })
    };
    this.withdrawals.set(id, updatedWithdrawal);
    return updatedWithdrawal;
  }

  // 收款链接相关
  createPaymentLink(link: Omit<PaymentLink, 'id' | 'createdAt' | 'updatedAt' | 'usedCount'>): PaymentLink {
    const id = `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newLink: PaymentLink = {
      ...link,
      id,
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.paymentLinks.set(id, newLink);
    this.saveData(); // 保存数据到localStorage
    
    // 同时保存到增强存储
    if (typeof window !== 'undefined') {
      try {
        const { enhancedStorage } = require('./storage-enhanced');
        enhancedStorage.createPaymentLink({
          ...link,
          id,
          usedCount: 0,
          createdAt: newLink.createdAt.toISOString(),
          updatedAt: newLink.updatedAt.toISOString()
        });
      } catch (error) {
        console.warn('Failed to save to enhanced storage:', error);
      }
    }
    
    return newLink;
  }

  getPaymentLinkById(id: string): PaymentLink | undefined {
    return this.paymentLinks.get(id);
  }

  getPaymentLinksByUserId(userId: string): PaymentLink[] {
    return Array.from(this.paymentLinks.values()).filter(link => link.userId === userId);
  }

  // 财务报表相关
  generateFinancialReport(userId?: string, type: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): FinancialReport {
    const now = new Date();
    let period: string;
    
    switch (type) {
      case 'daily':
        period = now.toISOString().split('T')[0];
        break;
      case 'weekly':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        period = weekStart.toISOString().split('T')[0];
        break;
      case 'monthly':
        period = now.toISOString().substring(0, 7);
        break;
      case 'yearly':
        period = now.getFullYear().toString();
        break;
    }

    const orders = Array.from(this.orders.values()).filter(order => {
      if (userId && order.userId !== userId) return false;
      const orderDate = new Date(order.createdAt);
      switch (type) {
        case 'daily':
          return orderDate.toDateString() === now.toDateString();
        case 'weekly':
          return orderDate >= new Date(now.setDate(now.getDate() - now.getDay()));
        case 'monthly':
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        case 'yearly':
          return orderDate.getFullYear() === now.getFullYear();
        default:
          return false;
      }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const totalUsers = userId ? 1 : this.users.size;
    const totalWithdrawals = Array.from(this.withdrawals.values())
      .filter(w => !userId || w.userId === userId)
      .reduce((sum, w) => sum + w.amount, 0);
    
    const platformFee = totalRevenue * 0.05; // 5% 平台费
    const netProfit = totalRevenue - platformFee - totalWithdrawals;

    const report: FinancialReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      period,
      totalRevenue,
      totalOrders,
      totalUsers,
      totalWithdrawals,
      platformFee,
      netProfit,
      createdAt: new Date()
    };

    this.financialReports.set(report.id, report);
    return report;
  }

  // 扣费规则相关
  getFeeRules(): FeeRule[] {
    return Array.from(this.feeRules.values());
  }

  calculateFee(amount: number, ruleId: string): number {
    const rule = this.feeRules.get(ruleId);
    if (!rule || !rule.isActive) return 0;
    
    if (rule.type === 'percentage') {
      return Math.max(rule.minAmount || 0, amount * rule.value);
    } else {
      return rule.value;
    }
  }

  // 支付方式相关
  getPaymentMethods(): PaymentMethod[] {
    return Array.from(this.paymentMethods.values()).filter(method => method.isActive);
  }

  // 数据持久化方法
  private saveData() {
    if (typeof window !== 'undefined') {
      try {
        const data = {
          users: Array.from(this.users.entries()),
          orders: Array.from(this.orders.entries()),
          payments: Array.from(this.payments.entries()),
          withdrawals: Array.from(this.withdrawals.entries()),
          financialReports: Array.from(this.financialReports.entries()),
          feeRules: Array.from(this.feeRules.entries()),
          paymentLinks: Array.from(this.paymentLinks.entries()),
          paymentMethods: Array.from(this.paymentMethods.entries())
        };
        localStorage.setItem('fengshui_database', JSON.stringify(data));
        console.log('💾 数据已保存到localStorage');
      } catch (error) {
        console.error('保存数据到localStorage失败:', error);
      }
    }
  }

  // 从localStorage加载数据
  private loadData() {
    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem('fengshui_database');
        if (data) {
          const parsedData = JSON.parse(data);
          
          // 恢复Map对象
          this.users = new Map(parsedData.users || []);
          this.orders = new Map(parsedData.orders || []);
          this.payments = new Map(parsedData.payments || []);
          this.withdrawals = new Map(parsedData.withdrawals || []);
          this.financialReports = new Map(parsedData.financialReports || []);
          this.feeRules = new Map(parsedData.feeRules || []);
          this.paymentLinks = new Map(parsedData.paymentLinks || []);
          this.paymentMethods = new Map(parsedData.paymentMethods || []);
          
          console.log('📂 数据已从localStorage加载');
        }
      } catch (error) {
        console.error('从localStorage加载数据失败:', error);
      }
    }
  }
}

// MySQL数据库连接
import mysql from 'mysql2/promise';

let connection: mysql.Connection | null = null;

export async function getConnection(): Promise<mysql.Connection> {
  if (!connection) {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fengshui_ecommerce',
      port: parseInt(process.env.DB_PORT || '3306'),
    });
  }
  return connection;
}

// 导出单例实例
export const db = new Database();
