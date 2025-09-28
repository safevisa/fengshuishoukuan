import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [支付统计] 开始生成支付统计数据...');
    
    // 获取所有数据
    const users = await mysqlDB.getAllUsers();
    const orders = await mysqlDB.getAllOrders();
    const payments = await mysqlDB.getAllPayments();
    const paymentLinks = await mysqlDB.getAllPaymentLinks();
    
    console.log('📊 [支付统计] 数据统计:', { 
      users: users.length, 
      orders: orders.length, 
      payments: payments.length, 
      paymentLinks: paymentLinks.length 
    });
    
    // 计算总体统计
    const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    const successPayments = payments.filter(p => p.status === 'completed');
    const successAmount = successPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    const successRate = payments.length > 0 ? (successPayments.length / payments.length * 100).toFixed(2) + '%' : '0%';
    
    const totalStats = {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalPayments: payments.length,
      totalPaymentLinks: paymentLinks.length,
      totalAmount: totalAmount,
      successPayments: successPayments.length,
      successAmount: successAmount,
      successRate: successRate
    };
    
    // 计算用户统计
    const userStats = users.map(user => {
      const userOrders = orders.filter(order => order.user_id === user.id);
      const userPayments = payments.filter(payment => 
        userOrders.some(order => order.id === payment.order_id)
      );
      const userPaymentLinks = paymentLinks.filter(link => link.userId === user.id);
      
      const userTotalAmount = userPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
      const userSuccessPayments = userPayments.filter(p => p.status === 'completed');
      const userSuccessAmount = userSuccessPayments.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
      const userSuccessRate = userPayments.length > 0 ? (userSuccessPayments.length / userPayments.length * 100).toFixed(2) + '%' : '0%';
      
      return {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        totalOrders: userOrders.length,
        totalPayments: userPayments.length,
        successPayments: userSuccessPayments.length,
        totalAmount: userTotalAmount,
        paymentLinks: userPaymentLinks.length,
        successRate: userSuccessRate
      };
    });
    
    const stats = {
      totalStats,
      userStats
    };
    
    console.log('✅ [支付统计] 统计数据生成成功');
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ [支付统计] 生成统计数据失败:', error);
    return NextResponse.json({
      success: false,
      message: '生成统计数据失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
