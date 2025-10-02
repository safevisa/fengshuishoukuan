import { getConnection } from './database';
import { User, Order, Payment, PaymentLink, Withdrawal, FinancialReport, ReconciliationReport } from './types';

export class MySQLDatabase {
  // 获取所有用户
  async getAllUsers(): Promise<User[]> {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM users ORDER BY created_at DESC');
    connection.release();
    
    // 转换日期字段
    const users = (rows as any[]).map(row => ({
      ...row,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
    }));
    
    return users as User[];
  }

  // 根据邮箱获取用户
  async getUserByEmail(email: string): Promise<User | null> {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    connection.release();
    
    const users = (rows as any[]).map(row => ({
      ...row,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
    }));
    
    return users.length > 0 ? users[0] : null;
  }

  // 根据ID获取用户
  async getUserById(userId: string): Promise<User | null> {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    connection.release();
    
    const users = (rows as any[]).map(row => ({
      ...row,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
    }));
    
    return users.length > 0 ? users[0] : null;
  }

  // 添加用户
  async addUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const connection = await getConnection();
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newUser: User = {
      id: userId,
      name: user.name || '',
      email: user.email || '',
      password: user.password || '',
      phone: user.phone || '',
      role: user.role || 'user',
      userType: user.userType || 'self_registered',
      status: user.status || 'active',
      balance: user.balance || 0,
      totalEarnings: user.totalEarnings || 0,
      totalWithdrawals: user.totalWithdrawals || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await connection.execute(
      'INSERT INTO users (id, name, email, password, phone, role, user_type, status, balance, total_earnings, total_withdrawals, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        newUser.id,
        newUser.name,
        newUser.email,
        newUser.password,
        newUser.phone,
        newUser.role,
        newUser.userType,
        newUser.status,
        newUser.balance,
        newUser.totalEarnings,
        newUser.totalWithdrawals,
        newUser.createdAt,
        newUser.updatedAt
      ]
    );
    
    connection.release();
    return newUser;
  }

    // 获取所有订单
  async getAllOrders(): Promise<Order[]> {
    const connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        o.id,
        o.user_id,
        u.name as user_name,
        u.email as user_email,
        o.amount,
        o.description,
        o.status,
        o.payment_link_id,
        o.payment_method,
        o.transaction_id,
        o.completed_at,
        o.created_at,
        o.updated_at
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    connection.release();
    
    // 手动映射字段名为camelCase
    const orders = (rows as any[]).map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      amount: row.amount,
      description: row.description,
      status: row.status,
      paymentLinkId: row.payment_link_id,
      paymentMethod: row.payment_method,
      transactionId: row.transaction_id,
      completedAt: row.completed_at ? new Date(row.completed_at) : null,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
    }));
    
    return orders as Order[];
  }

  // 添加订单
  async addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const connection = await getConnection();
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newOrder: Order = {
      id: orderId,
      userId: order.userId,
      amount: order.amount,
      status: order.status,
      paymentLinkId: order.paymentLinkId,
      paymentMethod: order.paymentMethod,
      transactionId: order.transactionId,
      completedAt: order.completedAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await connection.execute(
      'INSERT INTO orders (id, user_id, amount, status, payment_link_id, payment_method, transaction_id, completed_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        newOrder.id,
        newOrder.userId,
        newOrder.amount,
        newOrder.status,
        newOrder.paymentLinkId,
        newOrder.paymentMethod,
        newOrder.transactionId,
        newOrder.completedAt,
        newOrder.createdAt,
        newOrder.updatedAt
      ]
    );
    
    connection.release();
    return newOrder;
  }

  // 更新订单
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    const connection = await getConnection();
    const fields = [];
    const values = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.transactionId !== undefined) {
      fields.push('transaction_id = ?');
      values.push(updates.transactionId);
    }
    if (updates.completedAt !== undefined) {
      fields.push('completed_at = ?');
      values.push(updates.completedAt);
    }

    if (fields.length > 0) {
      values.push(orderId);
      await connection.execute(
        `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    connection.release();
  }

  // 获取所有支付记录
  async getAllPayments(): Promise<Payment[]> {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM payments ORDER BY created_at DESC');
    connection.release();
    
    // 转换日期字段
    const payments = (rows as any[]).map(row => ({
      ...row,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      updatedAt: row.updated_at ? new Date(row.updated_at) : new Date()
    }));
    
    return payments as Payment[];
  }

  // 添加支付记录
  async addPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const connection = await getConnection();
    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newPayment: Payment = {
      id: paymentId,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      currencyCode: payment.currencyCode,
      respCode: payment.respCode,
      respMsg: payment.respMsg,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await connection.execute(
      'INSERT INTO payments (id, order_id, amount, status, payment_method, transaction_id, currency_code, resp_code, resp_msg, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        newPayment.id,
        newPayment.orderId,
        newPayment.amount,
        newPayment.status,
        newPayment.paymentMethod,
        newPayment.transactionId,
        newPayment.currencyCode,
        newPayment.respCode,
        newPayment.respMsg,
        newPayment.createdAt,
        newPayment.updatedAt
      ]
    );
    
    connection.release();
    return newPayment;
  }

    // 获取所有收款链接
  // 获取所有收款链接
  async getAllPaymentLinks(): Promise<PaymentLink[]> {
    const connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        pl.id,
        pl.user_id,
        u.name as user_name,
        u.email as user_email,
        pl.amount,
        pl.description,
        pl.status,
        pl.payment_url,
        pl.payment_method,
        pl.transaction_id,
        pl.product_image,
        pl.max_uses,
        pl.used_count,
        pl.is_single_use,
        pl.created_at,
        pl.updated_at
      FROM payment_links pl
      LEFT JOIN users u ON pl.user_id = u.id
      ORDER BY pl.created_at DESC
    `);
    connection.release();
    
    // 手动映射字段名为camelCase
    const paymentLinks = (rows as any[]).map(row => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      amount: row.amount,
      description: row.description,
      status: row.status,
      paymentUrl: row.payment_url,
      paymentMethod: row.payment_method,
      transactionId: row.transaction_id,
      productImage: row.product_image,
      maxUses: row.max_uses,
      usedCount: row.used_count,
      isSingleUse: row.is_single_use,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    return paymentLinks as PaymentLink[];
  }


  // 根据用户ID获取收款链接
  async getPaymentLinksByUserId(userId: string): Promise<PaymentLink[]> {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM payment_links WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    connection.release();
    
    // 手动映射字段名为camelCase
    const paymentLinks = (rows as any[]).map(row => ({
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      description: row.description,
      status: row.status,
      paymentUrl: row.payment_url,
      paymentMethod: row.payment_method,
      transactionId: row.transaction_id,
      productImage: row.product_image,
      maxUses: row.max_uses,
      usedCount: row.used_count,
      isSingleUse: row.is_single_use,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    return paymentLinks as PaymentLink[];
  }

  // 根据ID获取收款链接
  async getPaymentLinkById(linkId: string): Promise<PaymentLink | null> {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM payment_links WHERE id = ? LIMIT 1',
      [linkId]
    );
    connection.release();
    
    const links = (rows as any[]).map(row => ({
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      description: row.description,
      status: row.status,
      paymentUrl: row.payment_url,
      paymentMethod: row.payment_method,
      transactionId: row.transaction_id,
      productImage: row.product_image,
      maxUses: row.max_uses,
      usedCount: row.used_count,
      isSingleUse: row.is_single_use,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    
    return links.length > 0 ? links[0] : null;
  }

  // 添加收款链接
async addPaymentLink(paymentLink: Omit<PaymentLink, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentLink> {
  const connection = await getConnection();
  const linkId = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newPaymentLink: PaymentLink = {
    id: linkId,
    userId: paymentLink.userId,
    amount: paymentLink.amount,
    description: paymentLink.description,
    status: paymentLink.status,
    paymentUrl: paymentLink.paymentUrl || `https://jinshiying.com/pay/${linkId}`,
    paymentMethod: paymentLink.paymentMethod || 'jkopay',
    transactionId: paymentLink.transactionId || null,
    productImage: paymentLink.productImage || null,
    maxUses: paymentLink.maxUses || 1,
    usedCount: paymentLink.usedCount || 0,
    isSingleUse: paymentLink.isSingleUse !== undefined ? paymentLink.isSingleUse : true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await connection.execute(
    'INSERT INTO payment_links (id, user_id, amount, description, status, payment_url, payment_method, transaction_id, product_image, max_uses, used_count, is_single_use, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      newPaymentLink.id,
      newPaymentLink.userId,
      newPaymentLink.amount,
      newPaymentLink.description,
      newPaymentLink.status,
      newPaymentLink.paymentUrl,
      newPaymentLink.paymentMethod,
      newPaymentLink.transactionId,
      newPaymentLink.productImage,
      newPaymentLink.maxUses,
      newPaymentLink.usedCount,
      newPaymentLink.isSingleUse,
      newPaymentLink.createdAt,
      newPaymentLink.updatedAt
    ]
  );
  
  connection.release();
  return newPaymentLink;
}

  // 更新收款链接
  async updatePaymentLink(linkId: string, updates: Partial<PaymentLink>): Promise<void> {
    const connection = await getConnection();
    const fields = [];
    const values = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.transactionId !== undefined) {
      fields.push('transaction_id = ?');
      values.push(updates.transactionId);
    }
    if (updates.usedCount !== undefined) {
      fields.push('used_count = ?');
      values.push(updates.usedCount);
    }
    if (updates.productImage !== undefined) {
      fields.push('product_image = ?');
      values.push(updates.productImage);
    }

    if (fields.length > 0) {
      values.push(linkId);
      await connection.execute(
        `UPDATE payment_links SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }
    
    connection.release();
  }

  // 增加收款链接使用次数
  async incrementPaymentLinkUsage(linkId: string): Promise<void> {
    const connection = await getConnection();
    await connection.execute(
      'UPDATE payment_links SET used_count = used_count + 1 WHERE id = ?',
      [linkId]
    );
    connection.release();
  }

  // 删除收款链接
  async deletePaymentLink(linkId: string): Promise<boolean> {
    const connection = await getConnection();
    const [result] = await connection.execute(
      'DELETE FROM payment_links WHERE id = ?',
      [linkId]
    );
    connection.release();
    
    return (result as any).affectedRows > 0;
  }

  // 获取所有提现记录
  async getAllWithdrawals(): Promise<Withdrawal[]> {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM withdrawals ORDER BY created_at DESC');
    connection.release();
    
    // 转换日期字段
    const withdrawals = (rows as any[]).map(row => ({
      ...row,
      createdAt: row.created_at ? new Date(row.created_at) : new Date(),
      updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
      requestDate: row.request_date ? new Date(row.request_date) : null
    }));
    
    return withdrawals as Withdrawal[];
  }

  // 添加提现记录
  async addWithdrawal(withdrawal: Omit<Withdrawal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Withdrawal> {
    const connection = await getConnection();
    const withdrawalId = `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newWithdrawal: Withdrawal = {
      id: withdrawalId,
      userId: withdrawal.userId,
      amount: withdrawal.amount,
      status: withdrawal.status,
      fee: withdrawal.fee,
      netAmount: withdrawal.netAmount,
      bankAccount: withdrawal.bankAccount,
      requestDate: withdrawal.requestDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await connection.execute(
      'INSERT INTO withdrawals (id, user_id, amount, status, fee, net_amount, bank_account, request_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        newWithdrawal.id,
        newWithdrawal.userId,
        newWithdrawal.amount,
        newWithdrawal.status,
        newWithdrawal.fee,
        newWithdrawal.netAmount,
        newWithdrawal.bankAccount,
        newWithdrawal.requestDate,
        newWithdrawal.createdAt,
        newWithdrawal.updatedAt
      ]
    );
    
    connection.release();
    return newWithdrawal;
  }

  // 生成财务报表
  async generateFinancialReport(): Promise<FinancialReport> {
    const connection = await getConnection();
    
    // 获取所有订单
    const [orders] = await connection.execute('SELECT * FROM orders');
    const [users] = await connection.execute('SELECT * FROM users');
    const [payments] = await connection.execute('SELECT * FROM payments');
    const [paymentLinks] = await connection.execute('SELECT * FROM payment_links');
    
    connection.release();
    
    const ordersData = orders as Order[];
    const usersData = users as User[];
    const paymentsData = payments as Payment[];
    const paymentLinksData = paymentLinks as PaymentLink[];
    
    // 计算总销售额
    const totalSales = ordersData
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
    
    const totalOrders = ordersData.length;
    const platformFee = Number(totalSales) * 0.03; // 3% 平台费
    const netRevenue = Number(totalSales) - Number(platformFee);
    const totalUsers = usersData.length;
    const totalPayments = paymentsData.length;
    const totalPaymentLinks = paymentLinksData.length;
    
    return {
      totalSales: isNaN(Number(totalSales)) ? 0 : Number(totalSales),
      totalOrders: totalOrders,
      platformFee: isNaN(Number(platformFee)) ? 0 : Number(platformFee),
      netRevenue: isNaN(Number(netRevenue)) ? 0 : Number(netRevenue),
      totalUsers: totalUsers,
      totalPayments: totalPayments,
      totalPaymentLinks: totalPaymentLinks,
      generatedAt: new Date().toISOString()
    };
  }

  // 生成对账报告
  async generateReconciliationReport(): Promise<ReconciliationReport> {
    const connection = await getConnection();
    
    // 获取所有订单
    const [orders] = await connection.execute('SELECT * FROM orders');
    
    connection.release();
    
    const ordersData = orders as Order[];
    
    // 按日期分组统计
    const dailyStats = new Map<string, { totalOrders: number; totalAmount: number; completedOrders: number; completedAmount: number }>();
    
    ordersData.forEach(order => {
      const date = order.createdAt && order.createdAt instanceof Date ? order.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      
      if (!dailyStats.has(date)) {
        dailyStats.set(date, { totalOrders: 0, totalAmount: 0, completedOrders: 0, completedAmount: 0 });
      }
      
      const dayStats = dailyStats.get(date)!;
      dayStats.totalOrders++;
      dayStats.totalAmount += Number(order.amount) || 0;
      
      if (order.status === 'completed') {
        dayStats.completedOrders++;
        dayStats.completedAmount += Number(order.amount) || 0;
      }
    });
    
    const dailyStatsArray = Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      totalOrders: stats.totalOrders,
      totalAmount: stats.totalAmount,
      completedOrders: stats.completedOrders,
      completedAmount: stats.completedAmount
    }));
    
    const totalOrders = ordersData.length;
    const totalAmount = ordersData.reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
    const completedOrders = ordersData.filter(order => order.status === 'completed').length;
    const completedAmount = ordersData
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
    
    return {
      dailyStats: dailyStatsArray,
      totalOrders: totalOrders,
      totalAmount: totalAmount,
      completedOrders: completedOrders,
      completedAmount: completedAmount,
      generatedAt: new Date().toISOString()
    };
  }
}

export const mysqlDB = new MySQLDatabase();