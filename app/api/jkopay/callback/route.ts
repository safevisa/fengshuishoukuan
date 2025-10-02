import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';
import { PaymentManager } from '@/lib/payment/manager';
import { PaymentCallback } from '@/lib/payment/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('📥 [街口支付回调] 开始处理支付回调...');
  
  try {
    const body = await request.text();
    console.log('📥 [街口支付回调] 原始回调数据:', body);
    
    // 解析回调参数
    const params = new URLSearchParams(body);
    const callbackData = Object.fromEntries(params.entries());
    
    console.log('📥 [街口支付回调] 解析后的回调数据:', callbackData);
    
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
      console.log('❌ [街口支付回调] 缺少订单号');
      return NextResponse.json({ success: false, message: '缺少订单号' }, { status: 400 });
    }
    
    // 构建回调数据
    const callback: PaymentCallback = {
      orderNo,
      respCode,
      respMsg,
      amount,
      currency: 'TWD',
      tradeNo,
      transactionId: tradeNo,
      status: 'pending',
      signature: hashcode,
      metadata: callbackData
    };

    // 验证签名
    const signatureValid = PaymentManager.verifyCallback('jkopay', 'TW', callback);
    if (!signatureValid) {
      console.log('⚠️ [街口支付回调] 签名验证失败，但继续处理支付数据');
    } else {
      console.log('✅ [街口支付回调] 签名验证成功');
    }
    
    // 从订单号中提取支付链接ID
    const parts = orderNo.split('_');
    const linkId = parts.slice(0, 3).join('_');
    console.log('🔍 [街口支付回调] 提取的链接ID:', linkId);
    
    // 查找对应的收款链接
    const paymentLink = await mysqlDB.getPaymentLinkById(linkId);
    
    if (!paymentLink) {
      console.log('❌ [街口支付回调] 未找到对应的收款链接:', linkId);
      return NextResponse.json({ success: false, message: '未找到对应的收款链接' }, { status: 404 });
    }
    
    console.log('✅ [街口支付回调] 找到收款链接:', paymentLink.id);
    
    // 查找对应的订单
    const orders = await mysqlDB.getAllOrders();
    const order = orders.find(o => o.payment_link_id === paymentLink.id);
    
    if (!order) {
      console.log('❌ [街口支付回调] 未找到对应的订单:', paymentLink.id);
      return NextResponse.json({ success: false, message: '未找到对应的订单' }, { status: 404 });
    }
    
    console.log('✅ [街口支付回调] 找到订单:', order.id);
    
    // 根据支付结果更新状态
    const isSuccess = respCode === '00' || respCode === '000' || respCode === '0000';
    
    if (isSuccess) {
      // 支付成功
      console.log('✅ [街口支付回调] 支付成功，开始更新数据...');
      
      // 更新订单状态
      await mysqlDB.updateOrder(order.id, { 
        status: 'completed',
        transactionId: tradeNo,
        completedAt: new Date()
      });
      console.log('✅ [街口支付回调] 订单状态已更新为completed');
      
      // 更新收款链接状态和使用次数
      await mysqlDB.updatePaymentLink(paymentLink.id, { 
        status: 'completed',
        transactionId: tradeNo
      });
      
      // 增加使用次数
      await mysqlDB.incrementPaymentLinkUsage(paymentLink.id);
      console.log('✅ [街口支付回调] 收款链接状态已更新为completed，使用次数已增加');
      
      // 创建支付记录
      const paymentAmount = amount ? parseFloat(amount) : paymentLink.amount; // 街口支付返回的是元
      const payment = await mysqlDB.addPayment({
        orderId: order.id,
        amount: paymentAmount,
        status: 'completed',
        paymentMethod: 'jkopay',
        transactionId: tradeNo || orderNo,
        currencyCode: currencyCode || 'TWD',
        respCode: respCode,
        respMsg: respMsg
      });
      console.log('✅ [街口支付回调] 支付记录已创建:', payment.id);
      
      // 验证数据更新
      const updatedPayments = await mysqlDB.getAllPayments();
      const updatedOrders = await mysqlDB.getAllOrders();
      const updatedLinks = await mysqlDB.getAllPaymentLinks();
      
      console.log('📊 [街口支付回调] 数据更新验证:');
      console.log('  支付记录数量:', updatedPayments.length);
      console.log('  订单数量:', updatedOrders.length);
      console.log('  收款链接数量:', updatedLinks.length);
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ [街口支付回调] 支付成功处理完成，耗时: ${processingTime}ms`);
      
      return NextResponse.json({ 
        success: true, 
        message: '支付成功处理完成',
        data: {
          orderId: order.id,
          paymentId: payment.id,
          amount: paymentAmount,
          transaction_id: tradeNo
        }
      });
      
    } else {
      // 支付失败 - 使用更具体的状态值
      const failureStatus = respMsg === 'Order Timeout' ? 'Order Timeout' : 'Payment Failed';
      console.log(`❌ [街口支付回调] 支付失败: ${respCode} ${respMsg}`);
      
      // 更新订单状态为失败
      await mysqlDB.updateOrder(order.id, { 
        status: failureStatus,
        transactionId: tradeNo,
        completedAt: new Date()
      });
      
      // 更新收款链接状态为失败
      await mysqlDB.updatePaymentLink(paymentLink.id, { 
        status: failureStatus,
        transactionId: tradeNo
      });
      
      // 创建失败的支付记录
      const paymentAmount = amount ? parseFloat(amount) : paymentLink.amount; // 街口支付返回的是元，不需要除以100
      await mysqlDB.addPayment({
        orderId: order.id,
        amount: paymentAmount,
        status: failureStatus,
        paymentMethod: 'jkopay',
        transactionId: tradeNo || orderNo,
        currencyCode: currencyCode || 'TWD',
        respCode: respCode,
        respMsg: respMsg
      });
      
      const processingTime = Date.now() - startTime;
      console.log(`❌ [街口支付回调] 支付失败处理完成，耗时: ${processingTime}ms`);
      
      return NextResponse.json({ 
        success: false, 
        message: '支付失败',
        data: {
          respCode,
          respMsg
        }
      });
    }
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [街口支付回调] 处理失败，耗时: ${processingTime}ms`, error);
    
    return NextResponse.json({
      success: false,
      message: '支付回调处理失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
