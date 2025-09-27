import { NextRequest, NextResponse } from 'next/server';
import { jkoPayService } from '@/lib/jkopay';

export async function POST(request: NextRequest) {
  try {
    // 测试支付请求
    const testOrder = {
      orderNo: 'TEST_' + Date.now(),
      amount: 100, // 100台币
      description: '测试支付',
      customerInfo: {
        name: '测试用户',
        email: 'test@example.com',
        phone: '0912345678',
        ip: '127.0.0.1'
      },
      goodsInfo: [{
        goodsID: 'test001',
        goodsName: '测试商品',
        quantity: '1',
        goodsPrice: '100'
      }]
    };

    console.log('📤 [测试支付] 发送测试支付请求:', testOrder);
    
    const result = await jkoPayService.createPayment(testOrder);
    
    return NextResponse.json({
      test: true,
      request: testOrder,
      response: result
    });
    
  } catch (error) {
    console.error('❌ [测试支付] 错误:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
