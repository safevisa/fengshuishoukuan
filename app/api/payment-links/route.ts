import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';
import crypto from 'crypto';

// 街口支付配置
const JKOPAY_CONFIG = {
  merNo: '1888',
  terNo: '88816',
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
  const orderNo = paymentLink.id;
  const amount = Math.round(paymentLink.amount * 100).toString();
  
  const params = {
    merNo: JKOPAY_CONFIG.merNo,
    terNo: JKOPAY_CONFIG.terNo,
    CharacterSet: 'UTF8',
    transType: 'sales',
    transModel: 'M',
    getPayLink: 'N',
    apiType: '1',
    amount: amount,
    currencyCode: 'TWD',
    orderNo: orderNo,
    merremark: paymentLink.description || '收款链接',
    returnURL: JKOPAY_CONFIG.returnUrl,
    merMgrURL: 'jinshiying.com',
    merNotifyURL: JKOPAY_CONFIG.notifyUrl,
    webInfo: 'userAgent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    language: 'zh_TW',
    cardCountry: 'TW',
    cardState: 'Taipei',
    cardCity: 'Taipei',
    cardAddress: '台北市信义区信义路五段7号',
    cardZipCode: '110',
    payIP: '127.0.0.1',
    cardFullName: 'Test.User',
    cardFullPhone: '0912345678',
    grCountry: 'TW',
    grState: 'Taipei',
    grCity: 'Taipei',
    grAddress: '台北市信义区信义路五段7号',
    grZipCode: '110',
    grEmail: 'test@example.com',
    grphoneNumber: '0912345678',
    grPerName: 'Test.User',
    goodsString: JSON.stringify({
      goodsInfo: [{
        goodsID: paymentLink.id,
        goodsName: paymentLink.description || '商品',
        quantity: '1',
        goodsPrice: amount
      }]
    }),
    cardType: 'jkopay'
  };

  const hashcode = generateJkopayHash(params);
  
  const formData = new URLSearchParams();
  Object.keys(params).forEach(key => {
    formData.append(key, (params as any)[key]);
  });
  formData.append('hashcode', hashcode);

  return `${JKOPAY_CONFIG.gatewayUrl}?${formData.toString()}`;
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