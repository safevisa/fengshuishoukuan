import { NextRequest, NextResponse } from 'next/server';
import { productionPaymentService } from '@/lib/production-payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkId, amount, description, customerEmail, customerPhone } = body;

    // 验证输入
    if (!linkId || !amount || !description) {
      return NextResponse.json({
        success: false,
        message: '缺少必要参数'
      }, { status: 400 });
    }

    if (!customerEmail || !customerPhone) {
      return NextResponse.json({
        success: false,
        message: '请填写邮箱和电话'
      }, { status: 400 });
    }

    // 创建支付请求
    const paymentResult = await productionPaymentService.createPaymentRequest({
      orderId: `order_${linkId}_${Date.now()}`,
      amount: Number(amount),
      currency: 'CNY',
      description: description,
      customerEmail: customerEmail,
      customerPhone: customerPhone
    });

    if (paymentResult.success) {
      return NextResponse.json({
        success: true,
        message: '支付请求创建成功',
        paymentUrl: paymentResult.paymentUrl,
        transactionId: paymentResult.transactionId
      });
    } else {
      return NextResponse.json({
        success: false,
        message: paymentResult.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({
      success: false,
      message: '创建支付失败，请重试'
    }, { status: 500 });
  }
}