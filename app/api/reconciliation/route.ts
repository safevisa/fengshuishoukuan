import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 [对账报告] 开始生成对账报告...');
    
    const reconciliationReport = await mysqlDB.generateReconciliationReport();
    
    console.log('✅ [对账报告] 对账报告生成成功:', reconciliationReport);
    
    return NextResponse.json({
      success: true,
      data: reconciliationReport
    });
    
  } catch (error) {
    console.error('❌ [对账报告] 生成对账报告失败:', error);
    return NextResponse.json({
      success: false,
      message: '生成对账报告失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
