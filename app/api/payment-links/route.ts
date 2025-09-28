import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

// 生成街口支付链接
function generateJkopayUrl(paymentLink: any): string {
  // 街口支付需要POST请求，不能直接生成GET URL
  // 返回一个简化的支付页面URL，实际支付通过POST请求处理
  return `https://jinshiying.com/pay/${paymentLink.id}`;
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 [支付链接] 获取支付链接...');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '用户ID不能为空'
      }, { status: 400 });
    }
    
    console.log('🔍 [支付链接] 请求用户ID:', userId);
    
    const paymentLinks = await mysqlDB.getPaymentLinksByUserId(userId);
    
    console.log('✅ [支付链接] 获取成功，数量:', paymentLinks.length);
    
    // 直接返回数组，与前端期望的格式一致
    return NextResponse.json(paymentLinks);
    
  } catch (error) {
    console.error('❌ [支付链接] 获取失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取支付链接失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description, userId } = body;
    
    console.log('💰 [支付链接] 创建支付链接:', { amount, description, userId });
    
    if (!amount || !description || !userId) {
      return NextResponse.json({
        success: false,
        message: '缺少必要参数'
      }, { status: 400 });
    }
    
    // 生成唯一的链接ID
    const linkId = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tempLink = {
      id: linkId,
      user_id: userId,
      amount: parseFloat(amount),
      description: description,
      status: 'active' as const,
      payment_url: '',
      payment_method: 'jkopay',
      transaction_id: null as string | null
    };

    const realPaymentUrl = generateJkopayUrl(tempLink);

    // 创建支付链接
    const paymentLink = await mysqlDB.addPaymentLink({
      ...tempLink,
      payment_url: realPaymentUrl
    });
    
    // 创建对应的订单
    const order = await mysqlDB.addOrder({
      user_id: userId,
      amount: parseFloat(amount),
      description: description,
      status: 'pending',
      payment_link_id: linkId,
      payment_method: 'jkopay',
      transaction_id: null,
      completed_at: null
    });
    
    console.log('✅ [支付链接] 创建成功:', paymentLink.id);
    console.log('🔗 [支付链接] 街口支付链接长度:', realPaymentUrl.length);
    
    return NextResponse.json({
      success: true,
      message: '支付链接创建成功',
      data: {
        paymentLink,
        order
      }
    });
    
  } catch (error) {
    console.error('❌ [支付链接] 创建失败:', error);
    return NextResponse.json({
      success: false,
      message: '创建支付链接失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}