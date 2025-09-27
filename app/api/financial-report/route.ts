import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function GET(request: NextRequest) {
  try {
    const financialReport = await productionDB.generateFinancialReport();
    return NextResponse.json({
      success: true,
      ...financialReport
    });
  } catch (error) {
    console.error('Get financial report error:', error);
    return NextResponse.json({
      success: false,
      message: '获取财务报告失败'
    }, { status: 500 });
  }
}

