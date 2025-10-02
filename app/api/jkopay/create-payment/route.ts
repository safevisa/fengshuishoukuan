import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';
import { PaymentManager } from '@/lib/payment/manager';
import { PaymentRequest } from '@/lib/payment/types';

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
    
    const amount = parseFloat(paymentLink.amount);
    const description = paymentLink.description;
    
    // 生成订单号
    const orderNo = `${linkId}_${Date.now()}`;
    
    // 使用新的支付管理器创建支付
    const paymentRequest: PaymentRequest = {
      orderNo,
      amount,
      currency: 'TWD',
      description,
      customerInfo: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        ip: '127.0.0.1',
        address: {
          country: 'TW',
          state: 'Taipei',
          city: 'Taipei',
          address: '台北市信义区信义路五段7号',
          zipCode: '110'
        }
      },
      goodsInfo: [{
        goodsID: linkId,
        goodsName: description,
        quantity: '1',
        goodsPrice: amount.toString()
      }]
    };

    const paymentResult = await PaymentManager.createPayment('jkopay', 'TW', paymentRequest);
    
    console.log('📊 [街口支付] 支付结果:', paymentResult);
    
    const { respCode, respMsg, paymentUrl, tradeNo } = paymentResult;
    
    // 检查响应状态
    if (respCode === '00' || respCode === '000' || respCode === '0000' || respCode === '003' || respCode === '004') {
      // 支付成功或需要重定向
      console.log('✅ [街口支付] 支付请求成功，重定向URL:', paymentUrl);
      
      return NextResponse.json({
        success: true,
        message: '支付请求创建成功',
        data: {
          orderNo: orderNo,
          respCode: respCode,
          respMsg: respMsg,
          paymentUrl: paymentUrl,
          amount: amount,
          currencyCode: 'TWD',
          tradeNo: tradeNo
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