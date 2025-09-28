import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';
import { jkoPayService } from '@/lib/jkopay';

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
    if (!jkoPayService.verifyCallbackSignature(callbackData)) {
      console.log('❌ [支付回调] 签名验证失败');
      return NextResponse.json({ success: false, message: '签名验证失败' }, { status: 400 });
    }
    
    console.log('✅ [支付回调] 签名验证成功');
    
    // 从订单号中提取支付链接ID
    const parts = orderNo.split('_');
    const linkId = parts.slice(0, 3).join('_');
    console.log('🔍 [支付回调] 提取的链接ID:', linkId);
    
    // 查找对应的收款链接
    const paymentLink = await mysqlDB.getPaymentLinkById(linkId);
    
    if (!paymentLink) {
      console.log('❌ [支付回调] 未找到对应的收款链接:', orderNo);
      return NextResponse.json({ success: false, message: '未找到对应的收款链接' }, { status: 404 });
    }
    
    console.log('✅ [支付回调] 找到收款链接:', paymentLink.id);
    
    // 查找对应的订单
    const orders = await mysqlDB.getAllOrders();
    const order = orders.find(o => o.payment_link_id === paymentLink.id);
    
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
      await mysqlDB.updateOrder(order.id, { 
        status: 'completed',
        transaction_id: tradeNo,
        completed_at: new Date()
      });
      console.log('✅ [支付回调] 订单状态已更新为completed');
      
      // 更新收款链接状态
      await mysqlDB.updatePaymentLink(paymentLink.id, { 
        status: 'completed',
        transaction_id: tradeNo
      });
      console.log('✅ [支付回调] 收款链接状态已更新为completed');
      
      // 创建支付记录
      const paymentAmount = amount ? parseFloat(amount) : paymentLink.amount; // 街口支付返回的是元
      const payment = await mysqlDB.addPayment({
        orderId: order.id,
        amount: paymentAmount,
        status: 'completed',
        paymentMethod: 'jkopay',
        transaction_id: tradeNo || orderNo,
        currencyCode: currencyCode || 'TWD',
        respCode: respCode,
        respMsg: respMsg
      });
      console.log('✅ [支付回调] 支付记录已创建:', payment.id);
      
      // 验证数据更新
      const updatedPayments = await mysqlDB.getAllPayments();
      const updatedOrders = await mysqlDB.getAllOrders();
      const updatedLinks = await mysqlDB.getAllPaymentLinks();
      
      console.log('📊 [支付回调] 数据更新验证:');
      console.log('  支付记录数量:', updatedPayments.length);
      console.log('  订单数量:', updatedOrders.length);
      console.log('  收款链接数量:', updatedLinks.length);
      console.log('  最新支付记录:', updatedPayments[updatedPayments.length - 1]);
      
    } else {
      // 支付失败
      console.log('❌ [支付回调] 支付失败，更新状态为failed');
      await mysqlDB.updateOrder(order.id, { 
        status: 'failed',
        transaction_id: tradeNo,
        completed_at: new Date()
      });
      await mysqlDB.updatePaymentLink(paymentLink.id, { 
        status: 'failed',
        transaction_id: tradeNo
      });
      
      // 创建失败的支付记录
      const paymentAmount = amount ? parseFloat(amount) : paymentLink.amount;
      await mysqlDB.addPayment({
        orderId: order.id,
        amount: paymentAmount,
        status: 'failed',
        paymentMethod: 'jkopay',
        transaction_id: tradeNo || orderNo,
        currencyCode: currencyCode || 'TWD',
        respCode: respCode,
        respMsg: respMsg
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