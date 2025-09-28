import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

export async function POST(request: NextRequest) {
  try {
    console.log('💰 [添加CC交易] 开始添加用户cc的102元交易到服务器数据库...');
    
    // 查找用户cc
    let ccUser = await mysqlDB.getUserByEmail('cc@jinshiying.com');
    if (!ccUser) {
      // 如果用户不存在，创建用户cc
      ccUser = await mysqlDB.addUser({
        email: 'cc@jinshiying.com',
        name: 'cc',
        password: 'ccjinshiying',
        role: 'user'
      });
      console.log('✅ 创建用户cc:', ccUser.id);
    } else {
      console.log('✅ 找到用户cc:', ccUser.id);
    }
    
    // 创建收款链接
    const paymentLink = await mysqlDB.addPaymentLink({
      id: 'link_1758636847941_dp942dz7v',
      userId: ccUser.id,
      amount: 102,
      description: '测试',
      status: 'completed',
      paymentUrl: 'https://jinshiying.com/pay/link_1758636847941_dp942dz7v',
      paymentMethod: 'jkopay'
    });
    console.log('✅ 创建收款链接:', paymentLink.id);
    
    // 创建订单
    const order = await mysqlDB.addOrder({
      userId: ccUser.id,
      amount: 102,
      description: '测试',
      status: 'completed',
      payment_link_id: paymentLink.id,
      paymentMethod: 'jkopay',
      transaction_id: 'JK20250924001',
      completed_at: new Date('2025-09-24T14:32:00+08:00')
    });
    console.log('✅ 创建订单:', order.id);
    
    // 创建支付记录
    const payment = await mysqlDB.addPayment({
      orderId: order.id,
      amount: 102,
      status: 'completed',
      paymentMethod: 'jkopay',
      transaction_id: 'JK20250924001',
      currencyCode: 'TWD',
      respCode: '00',
      respMsg: '支付成功'
    });
    console.log('✅ 创建支付记录:', payment.id);
    
    // 获取更新后的数据统计
    const users = await mysqlDB.getAllUsers();
    const orders = await mysqlDB.getAllOrders();
    const payments = await mysqlDB.getAllPayments();
    const paymentLinks = await mysqlDB.getAllPaymentLinks();
    
    console.log('📊 [添加CC交易] 服务器数据库统计更新:');
    console.log('  用户数量:', users.length);
    console.log('  订单数量:', orders.length);
    console.log('  支付数量:', payments.length);
    console.log('  收款链接数量:', paymentLinks.length);
    
    return NextResponse.json({
      success: true,
      message: '用户cc的102元交易已成功添加到服务器数据库',
      data: {
        user: ccUser,
        paymentLink,
        order,
        payment,
        statistics: {
          totalUsers: users.length,
          totalOrders: orders.length,
          totalPayments: payments.length,
          totalPaymentLinks: paymentLinks.length,
          totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0)
        }
      }
    });
    
  } catch (error) {
    console.error('❌ [添加CC交易] 添加失败:', error);
    return NextResponse.json({
      success: false,
      message: '添加交易失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [查询CC交易] 查询用户cc的交易数据...');
    
    // 查找用户cc
    const ccUser = await mysqlDB.getUserByEmail('cc@jinshiying.com');
    if (!ccUser) {
      return NextResponse.json({
        success: false,
        message: '未找到用户cc'
      }, { status: 404 });
    }
    
    // 获取用户cc的所有数据
    const orders = await mysqlDB.getAllOrders();
    const payments = await mysqlDB.getAllPayments();
    const paymentLinks = await mysqlDB.getAllPaymentLinks();
    
    const ccOrders = orders.filter(order => order.userId === ccUser.id);
    const ccPayments = payments.filter(payment => 
      ccOrders.some(order => order.id === payment.orderId)
    );
    const ccPaymentLinks = paymentLinks.filter(link => link.userId === ccUser.id);
    
    const totalAmount = ccPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const successPayments = ccPayments.filter(p => p.status === 'completed');
    const successAmount = successPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    return NextResponse.json({
      success: true,
      message: '用户cc的交易数据查询成功',
      data: {
        user: ccUser,
        orders: ccOrders,
        payments: ccPayments,
        paymentLinks: ccPaymentLinks,
        statistics: {
          totalOrders: ccOrders.length,
          totalPayments: ccPayments.length,
          successPayments: successPayments.length,
          totalAmount: totalAmount,
          successAmount: successAmount,
          successRate: ccPayments.length > 0 ? (successPayments.length / ccPayments.length * 100).toFixed(2) + '%' : '0%'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ [查询CC交易] 查询失败:', error);
    return NextResponse.json({
      success: false,
      message: '查询交易数据失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

