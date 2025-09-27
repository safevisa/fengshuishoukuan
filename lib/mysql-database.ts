import { getConnection } from './database';
import { User, Order, Payment, PaymentLink, Withdrawal, FinancialReport, ReconciliationReport } from './types';

export class MySQLDatabase {
  // 获取所有用户
  async getAllUsers(): Promise<User[]> {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM users ORDER BY created_at DESC');
    return rows as User[];
  }

  // 根据邮箱获取用户
  async getUserByEmail(email: string): Promise<User | null> {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  // 根据ID获取用户
  async getUserById(id: string): Promise<User | null> {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  // 获取所有订单
  async getAllOrders(): Promise<Order[]> {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM orders ORDER BY created_at DESC');
    return rows as Order[];
  }

  // 获取所有支付记录
  async getAllPayments(): Promise<Payment[]> {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM payments ORDER BY created_at DESC');
    return rows as Payment[];
  }

  // 获取所有支付链接
  async getAllPaymentLinks(): Promise<PaymentLink[]> {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM payment_links ORDER BY created_at DESC');
    
    const links = rows as PaymentLink[];
    console.log('🔍 [数据库] 查询到的支付链接:', links.map(link => ({
      id: link.id,
      userId: link.userId,
      amount: link.amount,
      description: link.description
    })));
    
    return links;
  }

  // 根据用户ID获取支付链接
  async getPaymentLinksByUserId(userId: string): Promise<PaymentLink[]> {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM payment_links WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows as PaymentLink[];
  }

  // 根据ID获取支付链接
  async getPaymentLinkById(id: string): Promise<PaymentLink | null> {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM payment_links WHERE id = ? LIMIT 1',
      [id]
    );
    
    const links = rows as PaymentLink[];
    return links.length > 0 ? links[0] : null;
  }

  // 删除支付链接
  async deletePaymentLink(id: string): Promise<boolean> {
    const connection = await getConnection();
    const [result] = await connection.execute(
      'DELETE FROM payment_links WHERE id = ?',
      [id]
    );
    
    return (result as any).affectedRows > 0;
  }

  // 添加用户
  async addUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const connection = await getConnection();
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const newUser: User = {
      id,
      ...user,
      createdAt: now,
      updatedAt: now
    };
    
    const sql = `
      INSERT INTO users (id, email, name, password, role, status, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(sql, [
      newUser.id, 
      newUser.email, 
      newUser.name, 
      newUser.password, 
      newUser.role, 
      newUser.status,
      newUser.createdAt, 
      newUser.updatedAt
    ]);
    
    return newUser;
  }

  // 更新用户
  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    const connection = await getConnection();
    const now = new Date();
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    const sql = `
      UPDATE users 
      SET ${fields}, updated_at = ? 
      WHERE id = ?
    `;
    
    await connection.execute(sql, [...values, now, id]);
    
    return await this.getUserById(id);
  }

  // 删除用户
  async deleteUser(id: string): Promise<boolean> {
    const connection = await getConnection();
    const [result] = await connection.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    
    return (result as any).affectedRows > 0;
  }

  // 添加支付链接
  async addPaymentLink(paymentLink: Omit<PaymentLink, 'createdAt' | 'updatedAt'>): Promise<PaymentLink> {
    const connection = await getConnection();
    const now = new Date();
    
    const newPaymentLink: PaymentLink = {
      ...paymentLink,
      createdAt: now,
      updatedAt: now
    };
    
    console.log('🔍 [数据库] 准备插入支付链接:', {
      id: newPaymentLink.id,
      userId: newPaymentLink.userId,
      amount: newPaymentLink.amount,
      description: newPaymentLink.description
    });
    
    const sql = `
      INSERT INTO payment_links (id, user_id, amount, description, status, payment_url, payment_method, transaction_id, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      newPaymentLink.id, 
      newPaymentLink.userId,  // 确保这个值不为 undefined
      newPaymentLink.amount, 
      newPaymentLink.description, 
      newPaymentLink.status,
      newPaymentLink.paymentUrl || null,
      newPaymentLink.paymentMethod,
      newPaymentLink.transactionId || null,
      newPaymentLink.createdAt, 
      newPaymentLink.updatedAt
    ];
    
    console.log('🔍 [数据库] SQL 参数:', params);
    
    await connection.execute(sql, params);
    
    console.log('✅ [数据库] 支付链接插入成功');
    
    return newPaymentLink;
  }

  // 更新支付链接
  async updatePaymentLink(id: string, updates: Partial<Omit<PaymentLink, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PaymentLink | null> {
    const connection = await getConnection();
    const now = new Date();
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    const sql = `
      UPDATE payment_links 
      SET ${fields}, updated_at = ? 
      WHERE id = ?
    `;
    
    await connection.execute(sql, [...values, now, id]);
    
    return await this.getPaymentLinkById(id);
  }

  // 添加订单
  async addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const connection = await getConnection();
    const id = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const newOrder: Order = {
      id,
      ...order,
      createdAt: now,
      updatedAt: now
    };
    
    const sql = `
      INSERT INTO orders (id, user_id, amount, description, status, payment_link_id, payment_method, transaction_id, completed_at, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(sql, [
      newOrder.id, 
      newOrder.userId, 
      newOrder.amount, 
      newOrder.description, 
      newOrder.status,
      newOrder.paymentLinkId || null,
      newOrder.paymentMethod || null,
      newOrder.transactionId || null,
      newOrder.completedAt || null,
      newOrder.createdAt, 
      newOrder.updatedAt
    ]);
    
    return newOrder;
  }

  // 添加支付记录
  async addPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const connection = await getConnection();
    const id = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const newPayment: Payment = {
      id,
      ...payment,
      createdAt: now,
      updatedAt: now
    };
    
    const sql = `
      INSERT INTO payments (id, order_id, amount, status, payment_method, transaction_id, currency_code, resp_code, resp_msg, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(sql, [
      newPayment.id, 
      newPayment.orderId, 
      newPayment.amount, 
      newPayment.status,
      newPayment.paymentMethod,
      newPayment.transactionId || null,
      newPayment.currencyCode || null,
      newPayment.respCode || null,
      newPayment.respMsg || null,
      newPayment.createdAt, 
      newPayment.updatedAt
    ]);
    
    return newPayment;
  }

  // 生成财务报表
  async generateFinancialReport(): Promise<FinancialReport> {
    console.log(' 开始生成财务报表...');
    
    try {
      const users = await this.getAllUsers();
      const orders = await this.getAllOrders();
      const payments = await this.getAllPayments();
      const paymentLinks = await this.getAllPaymentLinks();
      
      const totalUsers = users.length;
      const totalOrders = orders.length;
      const totalPayments = payments.length;
      const totalPaymentLinks = paymentLinks.length;
      
      const totalSales = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.amount, 0);
      
      const platformFee = totalSales * 0.03; // 3% 平台费
      const netRevenue = totalSales - platformFee;
      
      const report: FinancialReport = {
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalOrders,
        platformFee: parseFloat(platformFee.toFixed(2)),
        netRevenue: parseFloat(netRevenue.toFixed(2)),
        totalUsers,
        totalPayments,
        totalPaymentLinks,
        generatedAt: new Date().toISOString()
      };
      
      console.log('✅ 财务报表生成成功:', report);
      return report;
    } catch (error) {
      console.error('❌ 生成财务报表失败:', error);
      throw error;
    }
  }

  // 生成对账报告
  async generateReconciliationReport(): Promise<ReconciliationReport> {
    console.log('开始生成对账报告...');
    
    try {
      const orders = await this.getAllOrders();
      const payments = await this.getAllPayments();
      
      const totalOrders = orders.length;
      const totalPayments = payments.length;
      const totalAmount = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.amount, 0);
      
      // 按日期分组统计
      const dailyData = orders
        .filter(order => order.status === 'completed')
        .reduce((acc, order) => {
          const date = order.createdAt.toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = { count: 0, amount: 0 };
          }
          acc[date].count++;
          acc[date].amount += order.amount;
          return acc;
        }, {} as Record<string, { count: number; amount: number }>);
      
      const dailyDataArray = Object.entries(dailyData).map(([date, data]) => ({
        date: new Date(date).toISOString(),
        count: data.count,
        amount: parseFloat(data.amount.toFixed(2))
      }));
      
      const report: ReconciliationReport = {
        totalOrders,
        totalPayments,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        dailyData: dailyDataArray,
        generatedAt: new Date().toISOString()
      };
      
      console.log('✅ 对账报告生成成功:', report);
      return report;
    } catch (error) {
      console.error('❌ 生成对账报告失败:', error);
      throw error;
    }
  }

  // 获取所有提现记录
  async getAllWithdrawals(): Promise<Withdrawal[]> {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM withdrawals ORDER BY created_at DESC');
    return rows as Withdrawal[];
  }

  // 添加提现记录
  async addWithdrawal(withdrawal: Omit<Withdrawal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Withdrawal> {
    const connection = await getConnection();
    const id = `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    const newWithdrawal: Withdrawal = {
      id,
      ...withdrawal,
      createdAt: now,
      updatedAt: now
    };
    
    const sql = `
      INSERT INTO withdrawals (id, user_id, amount, status, bank_account, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(sql, [
      newWithdrawal.id, 
      newWithdrawal.userId, 
      newWithdrawal.amount, 
      newWithdrawal.status,
      newWithdrawal.bankAccount || null,
      newWithdrawal.createdAt, 
      newWithdrawal.updatedAt
    ]);
    
    return newWithdrawal;
  }
}

export const mysqlDB = new MySQLDatabase();
