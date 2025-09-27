import { User, Order, Payment, PaymentLink, FinancialReport, ReconciliationReport } from './types';

class ProductionDatabase {
  private users: Map<string, User> = new Map();
  private orders: Map<string, Order> = new Map();
  private payments: Map<string, Payment> = new Map();
  private paymentLinks: Map<string, PaymentLink> = new Map();
  private withdrawals: Map<string, any> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    console.log('🚀 开始初始化数据库...');
    
    // 只在用户map为空时初始化默认用户
    if (this.users.size === 0) {
      // 初始化基础用户数据
      const testUser: User = {
        id: 'user_1',
        email: 'gaofeng@jinshiying.com',
        name: '高风',
        password: 'password123',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const adminUser: User = {
        id: 'admin_1',
        email: 'admin@jinshiying.com',
        name: '管理员',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const ccUser: User = {
        id: 'user_cc',
        email: 'cc@jinshiying.com',
        name: 'cc',
        password: 'ccjinshiying',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.users.set(testUser.id, testUser);
      this.users.set(adminUser.id, adminUser);
      this.users.set(ccUser.id, ccUser);
    }

    console.log('✅ ProductionDB 初始化完成');
    console.log('📊 最终数据统计:');
    console.log('  用户数量:', this.users.size);
    console.log('  订单数量:', this.orders.size);
    console.log('  支付数量:', this.payments.size);
    console.log('  收款链接数量:', this.paymentLinks.size);
    console.log('  提现数量:', this.withdrawals.size);
  }

  // 用户管理
  async addUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // 订单管理
  async addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null;
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const order = this.orders.get(id);
    if (!order) return null;
    
    const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deleteOrder(id: string): Promise<boolean> {
    return this.orders.delete(id);
  }

  // 支付管理
  async addPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const id = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPayment: Payment = {
      ...payment,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return this.payments.get(id) || null;
  }

  async getAllPayments(): Promise<Payment[]> {
    const payments = Array.from(this.payments.values());
    console.log('📊 getAllPayments 返回:', payments.length, '条记录');
    return payments;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const payment = this.payments.get(id);
    if (!payment) return null;
    
    const updatedPayment = { ...payment, ...updates, updatedAt: new Date() };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  async deletePayment(id: string): Promise<boolean> {
    return this.payments.delete(id);
  }

  // 收款链接管理
  async addPaymentLink(link: Omit<PaymentLink, 'createdAt' | 'updatedAt'>): Promise<PaymentLink> {
    const newLink: PaymentLink = {
      ...link,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.paymentLinks.set(link.id, newLink);
    
    console.log('✅ 添加收款链接:', link.id);
    console.log('📊 当前所有收款链接ID:', Array.from(this.paymentLinks.keys()));
    
    return newLink;
  }

  async getPaymentLinkById(id: string): Promise<PaymentLink | null> {
    if (!id) {
      console.error('❌ 链接ID为空');
      return null;
    }
    
    console.log('🔍 查找收款链接:', id);
    console.log('📊 所有收款链接ID:', Array.from(this.paymentLinks.keys()));
    
    const link = this.paymentLinks.get(id);
    
    if (link) {
      console.log('✅ 找到收款链接:', link);
    } else {
      console.log('❌ 收款链接不存在:', id);
    }
    
    return link || null;
  }

  async getAllPaymentLinks(): Promise<PaymentLink[]> {
    const links = Array.from(this.paymentLinks.values());
    console.log('📊 getAllPaymentLinks 返回:', links.length, '条记录');
    return links;
  }

  async updatePaymentLink(id: string, updates: Partial<PaymentLink>): Promise<PaymentLink | null> {
    const link = this.paymentLinks.get(id);
    if (!link) return null;
    
    const updatedLink = { ...link, ...updates, updatedAt: new Date() };
    this.paymentLinks.set(id, updatedLink);
    return updatedLink;
  }

  async deletePaymentLink(id: string): Promise<boolean> {
    return this.paymentLinks.delete(id);
  }

  // 提现管理
  async addWithdrawal(withdrawal: any): Promise<any> {
    const id = `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newWithdrawal = {
      ...withdrawal,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.withdrawals.set(id, newWithdrawal);
    return newWithdrawal;
  }

  async getWithdrawalById(id: string): Promise<any | null> {
    return this.withdrawals.get(id) || null;
  }

  async getAllWithdrawals(): Promise<any[]> {
    const withdrawals = Array.from(this.withdrawals.values());
    console.log('📊 getAllWithdrawals 返回:', withdrawals.length, '条记录');
    return withdrawals;
  }

  async updateWithdrawal(id: string, updates: any): Promise<any | null> {
    const withdrawal = this.withdrawals.get(id);
    if (!withdrawal) return null;
    
    const updatedWithdrawal = { ...withdrawal, ...updates, updatedAt: new Date() };
    this.withdrawals.set(id, updatedWithdrawal);
    return updatedWithdrawal;
  }

  async deleteWithdrawal(id: string): Promise<boolean> {
    return this.withdrawals.delete(id);
  }

  // 财务报表生成
  async generateFinancialReport(): Promise<FinancialReport> {
    try {
      console.log('📊 开始生成财务报表...');
      
      const users = await this.getAllUsers();
      const orders = await this.getAllOrders();
      const payments = await this.getAllPayments();
      const paymentLinks = await this.getAllPaymentLinks();
      const withdrawals = await this.getAllWithdrawals();

      console.log('📊 数据统计:', {
        users: users.length,
        orders: orders.length,
        payments: payments.length,
        paymentLinks: paymentLinks.length,
        withdrawals: withdrawals.length
      });

      const totalSales = payments.reduce((sum, payment) => {
        return sum + (payment.amount || 0);
      }, 0);

      const totalOrders = orders.length;
      const platformFee = totalSales * 0.029;
      const netRevenue = totalSales - platformFee;

      const report: FinancialReport = {
        totalSales,
        totalOrders,
        platformFee,
        netRevenue,
        totalUsers: users.length,
        totalPayments: payments.length,
        totalPaymentLinks: paymentLinks.length,
        generatedAt: new Date()
      };

      console.log('✅ 财务报表生成成功:', report);
      return report;

    } catch (error) {
      console.error('❌ 生成财务报表失败:', error);
      return {
        totalSales: 0,
        totalOrders: 0,
        platformFee: 0,
        netRevenue: 0,
        totalUsers: 0,
        totalPayments: 0,
        totalPaymentLinks: 0,
        generatedAt: new Date()
      };
    }
  }

  // 对账报告生成
  async generateReconciliationReport(): Promise<ReconciliationReport> {
    try {
      console.log('📊 开始生成对账报告...');
      
      const orders = await this.getAllOrders();
      const payments = await this.getAllPayments();
      const paymentLinks = await this.getAllPaymentLinks();

      console.log('📊 对账数据统计:', {
        orders: orders.length,
        payments: payments.length,
        paymentLinks: paymentLinks.length
      });

      const dailyStats = new Map<string, {
        date: string;
        orders: number;
        payments: number;
        totalAmount: number;
      }>();

      orders.forEach(order => {
        const date = order.createdAt.toISOString().split('T')[0];
        if (!dailyStats.has(date)) {
          dailyStats.set(date, {
            date,
            orders: 0,
            payments: 0,
            totalAmount: 0
          });
        }
        const stats = dailyStats.get(date)!;
        stats.orders += 1;
      });

      payments.forEach(payment => {
        const date = payment.createdAt.toISOString().split('T')[0];
        if (!dailyStats.has(date)) {
          dailyStats.set(date, {
            date,
            orders: 0,
            payments: 0,
            totalAmount: 0
          });
        }
        const stats = dailyStats.get(date)!;
        stats.payments += 1;
        stats.totalAmount += payment.amount || 0;
      });

      const dailyData = Array.from(dailyStats.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const report: ReconciliationReport = {
        totalOrders: orders.length,
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, payment) => sum + (payment.amount || 0), 0),
        dailyData,
        generatedAt: new Date()
      };

      console.log('✅ 对账报告生成成功:', report);
      return report;

    } catch (error) {
      console.error('❌ 生成对账报告失败:', error);
      return {
        totalOrders: 0,
        totalPayments: 0,
        totalAmount: 0,
        dailyData: [],
        generatedAt: new Date()
      };
    }
  }
}

export const productionDB = new ProductionDatabase();