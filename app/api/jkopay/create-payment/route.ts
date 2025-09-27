import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// 街口支付配置
const JKOPAY_CONFIG = {
  merNo: process.env.JKOPAY_MERCHANT_ID || '1888',
  terNo: process.env.JKOPAY_TERMINAL_ID || '888506',
  secretKey: process.env.JKOPAY_SECRET_KEY || 'fe5b2c5ea084426bb1f6269acbac902f',
  apiUrl: process.env.JKOPAY_API_URL || 'https://gateway.suntone.com/payment/api/gotoPayment',
  returnUrl: process.env.JKOPAY_RETURN_URL || 'https://jinshiying.com/payment/return',
  notifyUrl: process.env.JKOPAY_NOTIFY_URL || 'https://jinshiying.com/api/payment/notify'
};

// 生成街口支付签名
function generateJKOPaySignature(data: any): string {
  const { hashcode, ...signData } = data;
  const sortedKeys = Object.keys(signData).sort();
  const signString = sortedKeys
    .map(key => `${key}=${String(signData[key])}`)
    .join('&') + `&${JKOPAY_CONFIG.secretKey}`;
  
  return crypto.createHash('sha256').update(signString, 'utf8').digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkId, customerName, customerEmail, customerPhone } = body;
    
    console.log('💳 [Jkopay支付] 创建支付请求:', { linkId, customerName, customerEmail, customerPhone });
    
    if (!linkId) {
      return NextResponse.json({
        success: false,
        message: '缺少支付链接ID'
      }, { status: 400 });
    }
    
    // 这里应该从数据库获取支付链接信息
    // 为了演示，我们使用默认值
    const amount = 102; // 从数据库获取实际金额
    const description = '测试'; // 从数据库获取实际描述
    
    // 生成订单号
    const orderNo = `${linkId}_${Date.now()}`;
    
    // 构建Jkopay请求数据
    const jkopayData = {
      merNo: JKOPAY_CONFIG.merNo,
      terNo: JKOPAY_CONFIG.terNo,
      orderNo: orderNo,
      amount: amount.toString(), // 直接使用元
      goodsPrice: amount.toString(), // 商品价格，也使用元
      currencyCode: 'TWD',
      goodsName: description,
      customerName: customerName || '客户',
      customerEmail: customerEmail || 'customer@example.com',
      customerPhone: customerPhone || '0912345678',
      returnUrl: JKOPAY_CONFIG.returnUrl,
      notifyUrl: JKOPAY_CONFIG.notifyUrl,
      transType: 'sales'
    };
    
    // 生成签名
    const signature = generateJKOPaySignature(jkopayData);
    jkopayData.hashcode = signature;
    
    console.log('🔐 [Jkopay支付] 签名生成完成');
    console.log('📤 [Jkopay支付] 发送请求到Jkopay API...');
    
    // 发送请求到Jkopay API
    const response = await fetch(JKOPAY_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(jkopayData).toString()
    });
    
    const responseText = await response.text();
    console.log('📥 [Jkopay支付] API响应:', responseText);
    
    // 解析响应
    const responseData = Object.fromEntries(new URLSearchParams(responseText));
    console.log('📊 [Jkopay支付] 解析后的响应:', responseData);
    
    const { respCode, respMsg, skipTo3DURL } = responseData;
    
    // 检查响应状态
    if (respCode === '00' || respCode === '000' || respCode === '0000' || respCode === '003' || respCode === '004') {
      // 支付成功或需要重定向
      console.log('✅ [Jkopay支付] 支付请求成功，重定向URL:', skipTo3DURL);
      
      return NextResponse.json({
        success: true,
        message: '支付请求创建成功',
        data: {
          orderNo: orderNo,
          respCode: respCode,
          respMsg: respMsg,
          paymentUrl: skipTo3DURL,
          amount: amount,
          currencyCode: 'TWD'
        }
      });
    } else {
      // 支付失败
      console.log('❌ [Jkopay支付] 支付请求失败:', respCode, respMsg);
      
      return NextResponse.json({
        success: false,
        message: '支付请求失败',
        data: {
          respCode: respCode,
          respMsg: respMsg
        }
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ [Jkopay支付] 创建支付失败:', error);
    return NextResponse.json({
      success: false,
      message: '创建支付失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}