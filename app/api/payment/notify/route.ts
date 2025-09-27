import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';
import crypto from 'crypto';

// 街口支付配置
const JKOPAY_CONFIG = {
  merNo: process.env.JKOPAY_MERCHANT_ID || '1888',
  terNo: process.env.JKOPAY_TERMINAL_ID || '888506',
  secretKey: process.env.JKOPAY_SECRET_KEY || 'fe5b2c5ea084426bb1f6269acbac902f',
};

// 验证街口支付回调签名
function verifyJKOPaySignature(data: any): boolean {
  try {
    const { hashcode, ...signData } = data;
    const sortedKeys = Object.keys(signData).sort();
    const signString = sortedKeys
      .map(key => `${key}=${String(signData[key])}`)
      .join('&') + `&${JKOPAY_CONFIG.secretKey}`;
    
    const expectedSignature = crypto.createHash('sha256').update(signString, 'utf8').digest('hex');
    return hashcode === expectedSignature;
  } catch (error) {
    console.error('签名验证失败:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('📥 [支付回调] 开始处理支付回调...');
  
  try {
    const body = await request.text();
    console.log('📥 [支付回调] 原始回调数据:', body);
    
    // 解析回调参数
    const params = new URLSearchParams(body);
    const callbackData = Object.fromEntries(params.entries());
    
    console.log('📥 [支付回调] 解析后的回调数据:', callbackData);
    
    const {
      orderNo,
      respCode,
      respMsg,
      amount,
      tradeNo,
      currencyCode,
      hashcode,
      transType,
      merNo,
      terNo
    } = callbackData;
    
    if (!orderNo) {
      console.log('❌ [支付回调] 缺少订单号');
      return NextResponse.json({ success: false, message: '缺少订单号' }, { status: 400 });
    }
    
    // 验证签名
    if (!verifyJKOPaySignature(callbackData)) {
      console.log('❌ [支付回调] 签名验证失败');
      return NextResponse.json({ success: false, message: '签名验证失败' }, { status: 400 });
    }
    
    console.log('✅ [支付回调] 签名验证成功');
    
    // 查找对应的收款链接
    const paymentLinks = await productionDB.getAllPaymentLinks();
    const paymentLink = paymentLinks.find(link => orderNo.includes(link.id));
    
    if (!paymentLink) {
      console.log('❌ [支付回调] 未找到对应的收款链接:', orderNo);
      return NextResponse.json({ success: false, message: '未找到对应的收款链接' }, { status: 404 });
    }
    
    console.log('✅ [支付回调] 找到收款链接:', paymentLink.id);
    
    // 查找对应的订单
    const orders = await productionDB.getAllOrders();
    const order = orders.find(o => o.paymentLinkId === paymentLink.id);
    
    if (!order) {
      console.log('❌ [支付回调] 未找到对应的订单:', paymentLink.id);
      return NextResponse.json({ success: false, message: '未找到对应的订单' }, { status: 404 });
    }
    
    console.log('✅ [支付回调] 找到订单:', order.id);
    
    // 根据支付结果更新状态
    const isSuccess = respCode === '00' || respCode === '000' || respCode === '0000';
    
    if (isSuccess) {
      // 支付成功
      console.log('✅ [支付回调] 支付成功，开始更新数据...');
      
      // 更新订单状态
      await productionDB.updateOrder(order.id, { 
        status: 'completed',
        transactionId: tradeNo,
        completedAt: new Date()
      });
      console.log('✅ [支付回调] 订单状态已更新为completed');
      
      // 更新收款链接状态
      await productionDB.updatePaymentLink(paymentLink.id, { 
        status: 'completed',
        transactionId: tradeNo
      });
      console.log('✅ [支付回调] 收款链接状态已更新为completed');
      
      // 创建支付记录
      const paymentAmount = amount ? parseFloat(amount) : paymentLink.amount;
      const payment = await productionDB.addPayment({
        orderId: order.id,
        amount: paymentAmount,
        status: 'completed',
        paymentMethod: 'jkopay',
        transactionId: tradeNo || orderNo,
        currencyCode: currencyCode || 'TWD',
        respCode: respCode,
        respMsg: respMsg,
        merNo: merNo,
        terNo: terNo,
        transType: transType
      });
      console.log('✅ [支付回调] 支付记录已创建:', payment.id);
      
      // 验证数据更新
      const updatedPayments = await productionDB.getAllPayments();
      const updatedOrders = await productionDB.getAllOrders();
      const updatedLinks = await productionDB.getAllPaymentLinks();
      
      console.log('📊 [支付回调] 数据更新验证:');
      console.log('  支付记录数量:', updatedPayments.length);
      console.log('  订单数量:', updatedOrders.length);
      console.log('  收款链接数量:', updatedLinks.length);
      console.log('  最新支付记录:', updatedPayments[updatedPayments.length - 1]);
      
    } else {
      // 支付失败
      console.log('❌ [支付回调] 支付失败，更新状态为failed');
      await productionDB.updateOrder(order.id, { 
        status: 'failed',
        transactionId: tradeNo,
        failedAt: new Date()
      });
      await productionDB.updatePaymentLink(paymentLink.id, { 
        status: 'failed',
        transactionId: tradeNo
      });
      
      // 创建失败的支付记录
      const paymentAmount = amount ? parseFloat(amount) : paymentLink.amount;
      await productionDB.addPayment({
        orderId: order.id,
        amount: paymentAmount,
        status: 'failed',
        paymentMethod: 'jkopay',
        transactionId: tradeNo || orderNo,
        currencyCode: currencyCode || 'TWD',
        respCode: respCode,
        respMsg: respMsg,
        merNo: merNo,
        terNo: terNo,
        transType: transType
      });
    }
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ [支付回调] 处理完成，耗时: ${responseTime}ms`);
    
    return NextResponse.json({ 
      success: true,
      message: '支付回调处理成功',
      orderNo: orderNo,
      status: isSuccess ? 'success' : 'failed',
      respCode: respCode,
      respMsg: respMsg
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ [支付回调] 处理失败:', {
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`
    });
    
    return NextResponse.json({
      success: false,
      message: '处理支付回调失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}