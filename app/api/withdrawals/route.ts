import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function GET(request: NextRequest) {
  try {
    const withdrawals = await productionDB.getAllWithdrawals();
    return NextResponse.json({
      success: true,
      withdrawals: withdrawals
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json({
      success: false,
      message: '获取提现记录失败'
    }, { status: 500 });
  }
}
