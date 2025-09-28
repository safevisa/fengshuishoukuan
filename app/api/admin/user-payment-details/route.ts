import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [用户收款详情] 开始获取用户收款详情...');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '用户ID不能为空'
      }, { status: 400 });
    }
    
    // 获取用户信息
    const user = await mysqlDB.getUserById(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 404 });
    }
    
    // 获取用户的支付链接
    const paymentLinks = await mysqlDB.getPaymentLinksByUserId(userId);
    
    // 获取用户的订单
    const allOrders = await mysqlDB.getAllOrders();
    const userOrders = allOrders.filter(order => order.user_id === userId);
    
    // 获取用户的支付记录
    const allPayments = await mysqlDB.getAllPayments();
    const userPayments = allPayments.filter(payment => payment.user_id === userId);
    
    // 计算统计数据
    const totalLinks = paymentLinks.length;
    const activeLinks = paymentLinks.filter(link => link.status === 'active').length;
    const completedLinks = paymentLinks.filter(link => link.status === 'completed').length;
    
    const totalOrders = userOrders.length;
    const completedOrders = userOrders.filter(order => order.status === 'completed').length;
    const pendingOrders = userOrders.filter(order => order.status === 'pending').length;
    
    const totalPayments = userPayments.length;
    const successfulPayments = userPayments.filter(payment => payment.status === 'success').length;
    const totalAmount = userPayments
      .filter(payment => payment.status === 'success')
      .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    
    // 按日期分组统计
    const dailyStats = userPayments
      .filter(payment => payment.status === 'success')
      .reduce((acc, payment) => {
        const date = payment.createdAt ? payment.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { count: 0, amount: 0 };
        }
        acc[date].count++;
        acc[date].amount += parseFloat(payment.amount || 0);
        return acc;
      }, {} as Record<string, { count: number; amount: number }>);
    
    const dailyStatsArray = Object.entries(dailyStats)
      .map(([date, data]) => ({
        date,
        count: data.count,
        amount: parseFloat(Number(data.amount).toFixed(2))
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // 获取收款链接详情（包含订单和支付信息）
    const linkDetails = await Promise.all(
      paymentLinks.map(async (link) => {
        const linkOrders = userOrders.filter(order => order.payment_link_id === link.id);
        const linkPayments = userPayments.filter(payment => 
          linkOrders.some(order => order.id === payment.order_id)
        );
        
        const linkTotalAmount = linkPayments
          .filter(payment => payment.status === 'success')
          .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
        
        return {
          ...link,
          orders: linkOrders,
          payments: linkPayments,
          totalAmount: parseFloat(Number(linkTotalAmount).toFixed(2)),
          successCount: linkPayments.filter(payment => payment.status === 'success').length
        };
      })
    );
    
    const result = {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          status: user.status,
          createdAt: user.createdAt
        },
        summary: {
          totalLinks,
          activeLinks,
          completedLinks,
          totalOrders,
          completedOrders,
          pendingOrders,
          totalPayments,
          successfulPayments,
          totalAmount: parseFloat(Number(totalAmount).toFixed(2)),
          successRate: totalPayments > 0 ? parseFloat(((successfulPayments / totalPayments) * 100).toFixed(2)) : 0
        },
        dailyStats: dailyStatsArray,
        linkDetails: linkDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }
    };
    
    console.log('✅ [用户收款详情] 获取成功:', {
      userId,
      totalLinks,
      totalOrders,
      totalPayments,
      totalAmount: result.data.summary.totalAmount
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ [用户收款详情] 获取失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取用户收款详情失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
