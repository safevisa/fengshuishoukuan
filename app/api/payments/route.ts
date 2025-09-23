import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function GET(request: NextRequest) {
  try {
    const payments = await productionDB.getAllPayments();
    return NextResponse.json({
      success: true,
      payments: payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json({
      success: false,
      message: '获取支付记录失败'
    }, { status: 500 });
  }
}
