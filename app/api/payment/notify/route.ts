import { NextRequest, NextResponse } from 'next/server';
import { productionPaymentService } from '@/lib/production-payment';
import { productionDB } from '@/lib/production-database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证支付回调签名
    const isValid = await productionPaymentService.verifyPaymentCallback(body);
    
    if (!isValid) {
      console.error('Invalid payment callback signature');
      return NextResponse.json({
        success: false,
        message: 'Invalid signature'
      }, { status: 400 });
    }

    const { orderId, transactionId, status, amount } = body;

    // 根据支付状态处理订单
    if (status === 'success') {
      // 支付成功，更新订单状态
      console.log(`Payment successful for order ${orderId}, transaction ${transactionId}`);
      
      // 这里应该更新订单状态为已支付
      // 可以发送确认邮件等
      
      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully'
      });
    } else if (status === 'failed') {
      // 支付失败
      console.log(`Payment failed for order ${orderId}`);
      
      return NextResponse.json({
        success: true,
        message: 'Payment failure recorded'
      });
    } else {
      // 其他状态
      console.log(`Payment status ${status} for order ${orderId}`);
      
      return NextResponse.json({
        success: true,
        message: 'Payment status updated'
      });
    }
  } catch (error) {
    console.error('Payment notification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Payment notification processing failed'
    }, { status: 500 });
  }
}