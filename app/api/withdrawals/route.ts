import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

export async function GET(request: NextRequest) {
  try {
    console.log('💰 获取提现记录...');
    
    const withdrawals = await mysqlDB.getAllWithdrawals();
    
    console.log('✅ 提现记录获取成功:', withdrawals.length, '条');
    
    return NextResponse.json({
      success: true,
      data: withdrawals,
      count: withdrawals.length
    });
    
  } catch (error) {
    console.error('❌ 获取提现记录失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取提现记录失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, bankAccount, status = 'pending' } = body;
    
    console.log('💰 创建提现记录:', { userId, amount, bankAccount, status });
    
    if (!userId || !amount || !bankAccount) {
      return NextResponse.json({
        success: false,
        message: '用户ID、金额和银行账户不能为空'
      }, { status: 400 });
    }
    
    const withdrawal = await mysqlDB.addWithdrawal({
      userId,
      amount: parseFloat(amount),
      bankAccount,
      status,
      requestDate: new Date()
    });
    
    console.log('✅ 提现记录创建成功:', withdrawal.id);
    
    return NextResponse.json({
      success: true,
      message: '提现记录创建成功',
      data: withdrawal
    });
    
  } catch (error) {
    console.error('❌ 创建提现记录失败:', error);
    return NextResponse.json({
      success: false,
      message: '创建提现记录失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}