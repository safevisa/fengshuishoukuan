import { NextRequest, NextResponse } from 'next/server';
import { productionPaymentService } from '@/lib/production-payment';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');

    if (!transactionId || !status) {
      return NextResponse.redirect(new URL('/payment/error?message=Missing payment parameters', request.url));
    }

    // 查询支付状态
    const paymentResult = await productionPaymentService.queryPaymentStatus(transactionId);
    
    if (paymentResult.success) {
      if (status === 'success') {
        return NextResponse.redirect(new URL('/payment/success?orderId=' + orderId, request.url));
      } else {
        return NextResponse.redirect(new URL('/payment/failed?orderId=' + orderId, request.url));
      }
    } else {
      return NextResponse.redirect(new URL('/payment/error?message=' + encodeURIComponent(paymentResult.message), request.url));
    }
  } catch (error) {
    console.error('Payment return processing error:', error);
    return NextResponse.redirect(new URL('/payment/error?message=Payment processing error', request.url));
  }
}
