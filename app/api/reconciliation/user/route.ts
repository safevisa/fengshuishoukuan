import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    console.log('📊 [用户对账] 查询参数:', { userId, startDate, endDate });
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '用户ID不能为空'
      }, { status: 400 });
    }
    
    // 获取用户订单
    const allOrders = await mysqlDB.getAllOrders();
    const userOrders = allOrders.filter(order => 
      order.userId === userId || order.user_id === userId
    );
    
    // 获取用户支付记录
    const allPayments = await mysqlDB.getAllPayments();
    const userPayments = allPayments.filter(payment => {
      const order = userOrders.find(o => o.id === payment.orderId);
      return order !== undefined;
    });
    
    // 获取用户收款链接
    const allPaymentLinks = await mysqlDB.getAllPaymentLinks();
    const userPaymentLinks = allPaymentLinks.filter(link => 
      link.userId === userId || link.user_id === userId
    );
    
    // 按日期分组统计
    const dailyStats = new Map<string, { 
      totalOrders: number; 
      totalAmount: number; 
      completedOrders: number; 
      completedAmount: number;
      paymentCount: number;
      paymentAmount: number;
    }>();
    
    userOrders.forEach(order => {
      const date = order.createdAt instanceof Date ? 
        order.createdAt.toISOString().split('T')[0] : 
        new Date(order.createdAt).toISOString().split('T')[0];
      
      if (!dailyStats.has(date)) {
        dailyStats.set(date, { 
          totalOrders: 0, 
          totalAmount: 0, 
          completedOrders: 0, 
          completedAmount: 0,
          paymentCount: 0,
          paymentAmount: 0
        });
      }
      
      const dayStats = dailyStats.get(date)!;
      dayStats.totalOrders++;
      dayStats.totalAmount += Number(order.amount) || 0;
      
      if (order.status === 'completed') {
        dayStats.completedOrders++;
        dayStats.completedAmount += Number(order.amount) || 0;
      }
    });
    
    // 统计支付记录
    userPayments.forEach(payment => {
      const order = userOrders.find(o => o.id === payment.orderId);
      if (order) {
        const date = order.createdAt instanceof Date ? 
          order.createdAt.toISOString().split('T')[0] : 
          new Date(order.createdAt).toISOString().split('T')[0];
        
        if (dailyStats.has(date)) {
          const dayStats = dailyStats.get(date)!;
          dayStats.paymentCount++;
          dayStats.paymentAmount += Number(payment.amount) || 0;
        }
      }
    });
    
    const dailyStatsArray = Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      totalOrders: stats.totalOrders,
      totalAmount: stats.totalAmount,
      completedOrders: stats.completedOrders,
      completedAmount: stats.completedAmount,
      paymentCount: stats.paymentCount,
      paymentAmount: stats.paymentAmount
    }));
    
    // 计算汇总数据
    const totalOrders = userOrders.length;
    const totalAmount = userOrders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
    const completedOrders = userOrders.filter(order => order.status === 'completed').length;
    const completedAmount = userOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
    
    const totalPayments = userPayments.length;
    const totalPaymentAmount = userPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    
    const successRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(2) : '0.00';
    
    console.log('✅ [用户对账] 统计完成:', {
      totalOrders,
      completedOrders,
      totalAmount,
      completedAmount,
      successRate
    });
    
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalOrders,
          totalAmount,
          completedOrders,
          completedAmount,
          totalPayments,
          totalPaymentAmount,
          successRate: `${successRate}%`,
          totalPaymentLinks: userPaymentLinks.length
        },
        dailyStats: dailyStatsArray,
        orders: userOrders,
        payments: userPayments,
        paymentLinks: userPaymentLinks,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [用户对账] 生成失败:', error);
    return NextResponse.json({
      success: false,
      message: '生成对账报表失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
