import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API检查] 开始检查所有数据API的调用状态...');
    
    const apiChecks = {
      users: { status: 'unknown', count: 0, error: null },
      orders: { status: 'unknown', count: 0, error: null },
      payments: { status: 'unknown', count: 0, error: null },
      paymentLinks: { status: 'unknown', count: 0, error: null },
      withdrawals: { status: 'unknown', count: 0, error: null },
      financialReport: { status: 'unknown', data: null, error: null },
      reconciliationReport: { status: 'unknown', data: null, error: null }
    };
    
    // 检查用户API
    try {
      const users = await productionDB.getAllUsers();
      apiChecks.users = { status: 'success', count: users.length, error: null };
      console.log('✅ 用户API正常，数量:', users.length);
    } catch (error) {
      apiChecks.users = { status: 'error', count: 0, error: error instanceof Error ? error.message : '未知错误' };
      console.error('❌ 用户API错误:', error);
    }
    
    // 检查订单API
    try {
      const orders = await productionDB.getAllOrders();
      apiChecks.orders = { status: 'success', count: orders.length, error: null };
      console.log('✅ 订单API正常，数量:', orders.length);
    } catch (error) {
      apiChecks.orders = { status: 'error', count: 0, error: error instanceof Error ? error.message : '未知错误' };
      console.error('❌ 订单API错误:', error);
    }
    
    // 检查支付API
    try {
      const payments = await productionDB.getAllPayments();
      apiChecks.payments = { status: 'success', count: payments.length, error: null };
      console.log('✅ 支付API正常，数量:', payments.length);
    } catch (error) {
      apiChecks.payments = { status: 'error', count: 0, error: error instanceof Error ? error.message : '未知错误' };
      console.error('❌ 支付API错误:', error);
    }
    
    // 检查收款链接API
    try {
      const paymentLinks = await productionDB.getAllPaymentLinks();
      apiChecks.paymentLinks = { status: 'success', count: paymentLinks.length, error: null };
      console.log('✅ 收款链接API正常，数量:', paymentLinks.length);
    } catch (error) {
      apiChecks.paymentLinks = { status: 'error', count: 0, error: error instanceof Error ? error.message : '未知错误' };
      console.error('❌ 收款链接API错误:', error);
    }
    
    // 检查提现API
    try {
      const withdrawals = await productionDB.getAllWithdrawals();
      apiChecks.withdrawals = { status: 'success', count: withdrawals.length, error: null };
      console.log('✅ 提现API正常，数量:', withdrawals.length);
    } catch (error) {
      apiChecks.withdrawals = { status: 'error', count: 0, error: error instanceof Error ? error.message : '未知错误' };
      console.error('❌ 提现API错误:', error);
    }
    
    // 检查财务报表API
    try {
      const financialReport = await productionDB.generateFinancialReport();
      apiChecks.financialReport = { status: 'success', data: financialReport, error: null };
      console.log('✅ 财务报表API正常');
    } catch (error) {
      apiChecks.financialReport = { status: 'error', data: null, error: error instanceof Error ? error.message : '未知错误' };
      console.error('❌ 财务报表API错误:', error);
    }
    
    // 检查对账报告API
    try {
      const reconciliationReport = await productionDB.generateReconciliationReport();
      apiChecks.reconciliationReport = { status: 'success', data: reconciliationReport, error: null };
      console.log('✅ 对账报告API正常');
    } catch (error) {
      apiChecks.reconciliationReport = { status: 'error', data: null, error: error instanceof Error ? error.message : '未知错误' };
      console.error('❌ 对账报告API错误:', error);
    }
    
    // 计算总体状态
    const totalChecks = Object.keys(apiChecks).length;
    const successChecks = Object.values(apiChecks).filter(check => check.status === 'success').length;
    const errorChecks = Object.values(apiChecks).filter(check => check.status === 'error').length;
    
    const overallStatus = errorChecks === 0 ? 'healthy' : errorChecks < totalChecks / 2 ? 'warning' : 'critical';
    
    console.log('📊 [API检查] 检查完成:', {
      total: totalChecks,
      success: successChecks,
      errors: errorChecks,
      status: overallStatus
    });
    
    return NextResponse.json({
      success: true,
      message: 'API检查完成',
      data: {
        overallStatus,
        summary: {
          total: totalChecks,
          success: successChecks,
          errors: errorChecks,
          successRate: `${((successChecks / totalChecks) * 100).toFixed(1)}%`
        },
        apiChecks,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [API检查] 检查失败:', error);
    return NextResponse.json({
      success: false,
      message: 'API检查失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

