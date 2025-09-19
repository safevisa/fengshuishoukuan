import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/payment'

export async function POST(request: NextRequest) {
  try {
    const { paymentId, amount } = await request.json()

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: '缺少支付ID' },
        { status: 400 }
      )
    }

    const result = await paymentService.refundPayment(paymentId, amount)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          refundId: result.refundId
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
