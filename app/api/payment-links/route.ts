import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';
import crypto from 'crypto';

// 街口支付配置
const JKOPAY_CONFIG = {
  merNo: '1888',
  terNo: '888506',
  secretKey: 'fe5b2c5ea084426bb1f6269acbac902f',
  gatewayUrl: 'https://gateway.suntone.com/payment/api/gotoPayment',
  returnUrl: 'https://jinshiying.com/payment/return',
  notifyUrl: 'https://jinshiying.com/api/jkopay/callback'
};

// 生成街口支付签名
function generateJkopayHash(params: Record<string, string>): string {
  const sortedParams = [
    `amount=${params.amount}`,
    `currencyCode=${params.currencyCode}`,
    `merNo=${params.merNo}`,
    `orderNo=${params.orderNo}`,
    `payIP=${params.payIP}`,
    `transType=${params.transType}`,
    `transModel=${params.transModel}`,
    JKOPAY_CONFIG.secretKey
  ].join('&');
  
  return crypto.createHash('sha256').update(sortedParams).digest('hex');
}

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
      userId: userId,
      amount: parseFloat(amount),
      description: description,
      status: 'active' as const,
      paymentUrl: '',
      paymentMethod: 'jkopay',
      transactionId: null as string | null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const realPaymentUrl = generateJkopayUrl(tempLink);

    // 创建支付链接
    const paymentLink = await mysqlDB.addPaymentLink({
      ...tempLink,
      paymentUrl: realPaymentUrl
    });
    
    // 创建对应的订单
    const order = await mysqlDB.addOrder({
      userId: userId,
      amount: parseFloat(amount),
      description: description,
      status: 'pending',
      paymentLinkId: linkId,
      paymentMethod: 'jkopay'
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