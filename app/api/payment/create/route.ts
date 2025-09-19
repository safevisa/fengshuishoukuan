import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/payment'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentMethodId } = await request.json()

    if (!orderId || !paymentMethodId) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const order = db.getOrderById(orderId)
    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      )
    }

    const result = await paymentService.createPayment(order, paymentMethodId)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          paymentUrl: result.paymentUrl,
          paymentId: result.paymentId
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
