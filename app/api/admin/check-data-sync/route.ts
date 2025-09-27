import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 [数据同步检查] 开始检查用户端和管理端数据同步状态...');
    
    // 获取所有数据
    const users = await mysqlDB.getAllUsers();
    const orders = await mysqlDB.getAllOrders();
    const payments = await mysqlDB.getAllPayments();
    const paymentLinks = await mysqlDB.getAllPaymentLinks();
    
    // 检查数据一致性
    const syncChecks = {
      userOrderConsistency: { status: 'unknown', issues: [], details: null },
      orderPaymentConsistency: { status: 'unknown', issues: [], details: null },
      paymentLinkOrderConsistency: { status: 'unknown', issues: [], details: null },
      amountConsistency: { status: 'unknown', issues: [], details: null },
      statusConsistency: { status: 'unknown', issues: [], details: null }
    };
    
    // 1. 检查用户-订单一致性
    const userOrderIssues = [];
    orders.forEach(order => {
      const user = users.find(u => u.id === order.userId);
      if (!user) {
        userOrderIssues.push({
          type: 'missing_user',
          orderId: order.id,
          userId: order.userId,
          message: '订单关联的用户不存在'
        });
      }
    });
    syncChecks.userOrderConsistency = {
      status: userOrderIssues.length === 0 ? 'success' : 'error',
      issues: userOrderIssues,
      details: {
        totalOrders: orders.length,
        ordersWithValidUsers: orders.length - userOrderIssues.length,
        ordersWithMissingUsers: userOrderIssues.length
      }
    };
    
    // 2. 检查订单-支付一致性
    const orderPaymentIssues = [];
    orders.forEach(order => {
      const orderPayments = payments.filter(p => p.orderId === order.id);
      if (orderPayments.length === 0 && order.status === 'completed') {
        orderPaymentIssues.push({
          type: 'completed_order_no_payment',
          orderId: order.id,
          orderStatus: order.status,
          message: '已完成的订单没有对应的支付记录'
        });
      }
    });
    
    payments.forEach(payment => {
      const order = orders.find(o => o.id === payment.orderId);
      if (!order) {
        orderPaymentIssues.push({
          type: 'payment_no_order',
          paymentId: payment.id,
          orderId: payment.orderId,
          message: '支付记录没有对应的订单'
        });
      }
    });
    
    syncChecks.orderPaymentConsistency = {
      status: orderPaymentIssues.length === 0 ? 'success' : 'warning',
      issues: orderPaymentIssues,
      details: {
        totalOrders: orders.length,
        totalPayments: payments.length,
        ordersWithPayments: orders.filter(o => payments.some(p => p.orderId === o.id)).length,
        paymentsWithOrders: payments.filter(p => orders.some(o => o.id === p.orderId)).length
      }
    };
    
    // 3. 检查收款链接-订单一致性
    const paymentLinkOrderIssues = [];
    paymentLinks.forEach(link => {
      const linkOrders = orders.filter(o => o.paymentLinkId === link.id);
      if (linkOrders.length === 0 && link.status === 'completed') {
        paymentLinkOrderIssues.push({
          type: 'completed_link_no_order',
          linkId: link.id,
          linkStatus: link.status,
          message: '已完成的收款链接没有对应的订单'
        });
      }
    });
    
    orders.forEach(order => {
      if (order.paymentLinkId) {
        const link = paymentLinks.find(l => l.id === order.paymentLinkId);
        if (!link) {
          paymentLinkOrderIssues.push({
            type: 'order_no_link',
            orderId: order.id,
            paymentLinkId: order.paymentLinkId,
            message: '订单关联的收款链接不存在'
          });
        }
      }
    });
    
    syncChecks.paymentLinkOrderConsistency = {
      status: paymentLinkOrderIssues.length === 0 ? 'success' : 'warning',
      issues: paymentLinkOrderIssues,
      details: {
        totalPaymentLinks: paymentLinks.length,
        totalOrders: orders.length,
        linksWithOrders: paymentLinks.filter(l => orders.some(o => o.paymentLinkId === l.id)).length,
        ordersWithLinks: orders.filter(o => o.paymentLinkId && paymentLinks.some(l => l.id === o.paymentLinkId)).length
      }
    };
    
    // 4. 检查金额一致性
    const amountIssues = [];
    orders.forEach(order => {
      const orderPayments = payments.filter(p => p.orderId === order.id);
      const totalPaymentAmount = orderPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      if (Math.abs(totalPaymentAmount - order.amount) > 0.01) {
        amountIssues.push({
          type: 'amount_mismatch',
          orderId: order.id,
          orderAmount: order.amount,
          paymentAmount: totalPaymentAmount,
          difference: totalPaymentAmount - order.amount,
          message: '订单金额与支付金额不匹配'
        });
      }
    });
    
    syncChecks.amountConsistency = {
      status: amountIssues.length === 0 ? 'success' : 'warning',
      issues: amountIssues,
      details: {
        totalOrders: orders.length,
        ordersWithAmountIssues: amountIssues.length,
        totalMismatchAmount: amountIssues.reduce((sum, issue) => sum + Math.abs(issue.difference), 0)
      }
    };
    
    // 5. 检查状态一致性
    const statusIssues = [];
    orders.forEach(order => {
      const orderPayments = payments.filter(p => p.orderId === order.id);
      const hasSuccessPayment = orderPayments.some(p => p.status === 'completed');
      
      if (order.status === 'completed' && !hasSuccessPayment) {
        statusIssues.push({
          type: 'order_completed_no_success_payment',
          orderId: order.id,
          orderStatus: order.status,
          paymentStatuses: orderPayments.map(p => p.status),
          message: '订单状态为已完成但没有成功的支付记录'
        });
      }
      
      if (order.status === 'pending' && hasSuccessPayment) {
        statusIssues.push({
          type: 'order_pending_has_success_payment',
          orderId: order.id,
          orderStatus: order.status,
          paymentStatuses: orderPayments.map(p => p.status),
          message: '订单状态为待处理但有成功的支付记录'
        });
      }
    });
    
    syncChecks.statusConsistency = {
      status: statusIssues.length === 0 ? 'success' : 'warning',
      issues: statusIssues,
      details: {
        totalOrders: orders.length,
        ordersWithStatusIssues: statusIssues.length
      }
    };
    
    // 计算总体同步状态
    const totalIssues = Object.values(syncChecks).reduce((sum, check) => sum + check.issues.length, 0);
    const criticalIssues = Object.values(syncChecks).filter(check => check.status === 'error').length;
    const warningIssues = Object.values(syncChecks).filter(check => check.status === 'warning').length;
    
    let overallSyncStatus = 'healthy';
    if (criticalIssues > 0) {
      overallSyncStatus = 'critical';
    } else if (warningIssues > 0 || totalIssues > 0) {
      overallSyncStatus = 'warning';
    }
    
    console.log('📊 [数据同步检查] 检查完成:', {
      overallStatus: overallSyncStatus,
      totalIssues,
      criticalIssues,
      warningIssues
    });
    
    return NextResponse.json({
      success: true,
      message: '数据同步检查完成',
      data: {
        overallSyncStatus,
        summary: {
          totalIssues,
          criticalIssues,
          warningIssues,
          dataCounts: {
            users: users.length,
            orders: orders.length,
            payments: payments.length,
            paymentLinks: paymentLinks.length
          }
        },
        syncChecks,
        recommendations: generateRecommendations(syncChecks),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [数据同步检查] 检查失败:', error);
    return NextResponse.json({
      success: false,
      message: '数据同步检查失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

function generateRecommendations(syncChecks: any): string[] {
  const recommendations = [];
  
  if (syncChecks.userOrderConsistency.status === 'error') {
    recommendations.push('修复用户-订单关联问题：删除或修复没有有效用户的订单');
  }
  
  if (syncChecks.orderPaymentConsistency.status === 'warning') {
    recommendations.push('检查订单-支付关联：确保每个订单都有对应的支付记录');
  }
  
  if (syncChecks.paymentLinkOrderConsistency.status === 'warning') {
    recommendations.push('检查收款链接-订单关联：确保收款链接和订单正确关联');
  }
  
  if (syncChecks.amountConsistency.status === 'warning') {
    recommendations.push('修复金额不一致问题：检查订单金额和支付金额是否匹配');
  }
  
  if (syncChecks.statusConsistency.status === 'warning') {
    recommendations.push('修复状态不一致问题：确保订单状态和支付状态保持一致');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('数据同步状态良好，无需修复');
  }
  
  return recommendations;
}

