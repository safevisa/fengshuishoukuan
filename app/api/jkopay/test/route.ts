import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 测试街口支付API连接...')
    
    // 暂时返回成功，用于测试前端流程
    return NextResponse.json({
      success: true,
      message: '街口支付API连接测试成功（模拟）',
      data: {
        status: 'connected',
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ 街口支付API测试失败:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'API连接测试失败',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}
