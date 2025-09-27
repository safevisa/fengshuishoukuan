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

// 生成街口支付签名 - 严格按照接口文档示例
function generateJkopayHash(params: Record<string, string>): string {
  // 按照接口文档中的签名示例：
  // EncryptionMode=SHA256&CharacterSet=UTF8&merNo=1888&terNo=88816&orderNo=109116361045&currencyCode=USD&amount=98.99&payIP=116.30.222.69&transType=sales&transModel=M&9e3870716b3e4e939dcc254bce0cec9a
  const signString = [
    `EncryptionMode=SHA256`,
    `CharacterSet=UTF8`,
    `merNo=${params.merNo}`,
    `terNo=${params.terNo}`,
    `orderNo=${params.orderNo}`,
    `currencyCode=${params.currencyCode}`,
    `amount=${params.amount}`,
    `payIP=${params.payIP}`,
    `transType=${params.transType}`,
    `transModel=${params.transModel}`,
    JKOPAY_CONFIG.secretKey
  ].join('&');
  
  console.log('🔐 [街口支付] 签名字符串:', signString);
  
  const hash = crypto.createHash('sha256').update(signString).digest('hex');
  console.log('🔐 [街口支付] 生成的签名:', hash);
  
  return hash;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkId, customerName, customerEmail, customerPhone } = body;
    
    console.log('💳 [街口支付] 创建支付请求:', { linkId, customerName, customerEmail, customerPhone });
    
    if (!linkId) {
      return NextResponse.json({
        success: false,
        message: '缺少支付链接ID'
      }, { status: 400 });
    }
    
    // 从数据库获取支付链接信息
    const paymentLink = await mysqlDB.getPaymentLinkById(linkId);
    
    if (!paymentLink) {
      return NextResponse.json({
        success: false,
        message: '支付链接不存在'
      }, { status: 404 });
    }
    
    const amount = paymentLink.amount;
    const description = paymentLink.description;
    
    // 生成订单号
    const orderNo = `${linkId}_${Date.now()}`;
    
    // 构建街口支付请求数据
    const jkopayData = {
      merNo: JKOPAY_CONFIG.merNo,
      terNo: JKOPAY_CONFIG.terNo,
      CharacterSet: 'UTF8',
      transType: 'sales',
      transModel: 'M',
      getPayLink: 'N',
      apiType: '1',
      amount: Math.round(amount * 100).toString(), // 转换为分
      currencyCode: 'TWD',
      orderNo: orderNo,
      merremark: description,
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
      cardFullName: customerName || 'Test.User',
      cardFullPhone: customerPhone || '0912345678',
      grCountry: 'TW',
      grState: 'Taipei',
      grCity: 'Taipei',
      grAddress: '台北市信义区信义路五段7号',
      grZipCode: '110',
      grEmail: customerEmail || 'test@example.com',
      grphoneNumber: customerPhone || '0912345678',
      grPerName: customerName || 'Test.User',
      goodsString: JSON.stringify({
        goodsInfo: [{
          goodsID: linkId,
          goodsName: description,
          quantity: '1',
          goodsPrice: Math.round(amount * 100).toString()
        }]
      }),
      cardType: 'jkopay'
    };

    // 生成签名
    const hashcode = generateJkopayHash(jkopayData);
    jkopayData.hashcode = hashcode;
    
    console.log('🔐 [街口支付] 签名生成完成');
    console.log('📤 [街口支付] 发送POST请求到街口支付API...');
    
    // 发送POST请求到街口支付API
    const response = await fetch(JKOPAY_CONFIG.gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(jkopayData).toString()
    });
    
    const responseText = await response.text();
    console.log('📥 [街口支付] API响应:', responseText);
    
    // 解析响应
    const responseData = Object.fromEntries(new URLSearchParams(responseText));
    console.log('📊 [街口支付] 解析后的响应:', responseData);
    
    const { respCode, respMsg, skipTo3DURL } = responseData;
    
    // 检查响应状态
    if (respCode === '00' || respCode === '000' || respCode === '0000' || respCode === '003' || respCode === '004') {
      // 支付成功或需要重定向
      console.log('✅ [街口支付] 支付请求成功，重定向URL:', skipTo3DURL);
      
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
      console.log('❌ [街口支付] 支付请求失败:', respCode, respMsg);
      
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
    console.error('❌ [街口支付] 创建支付失败:', error);
    return NextResponse.json({
      success: false,
      message: '创建支付失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}