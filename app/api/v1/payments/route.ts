import { NextRequest, NextResponse } from 'next/server'
import { ProductionPaymentService } from '@/lib/payment/production-payment'

const paymentService = new ProductionPaymentService()

// 创建支付
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentLinkId, amount, currency, paymentMethodId } = body

    // 验证必需字段
    if (!paymentLinkId || !amount || !currency || !paymentMethodId) {
      return NextResponse.json(
        { success: false, error: '缺少必需字段' },
        { status: 400 }
      )
    }

    // 这里应该从数据库获取收款链接和创建订单
    // const paymentLink = await db.paymentLinks.findById(paymentLinkId)
    // const order = await db.orders.create({...})

    // 模拟创建支付
    const result = await paymentService.createPaymentLink(
      {
        id: paymentLinkId,
        userId: 'current_user_id',
        title: '测试收款',
        amount,
        currency,
        paymentMethodId,
        isActive: true,
        usedCount: 0,
        successCount: 0,
        totalAmount: 0,
        requireAuth: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `order_${Date.now()}`,
        userId: 'current_user_id',
        orderNumber: `ORD${Date.now()}`,
        status: 'pending',
        totalAmount: amount,
        currency,
        taxAmount: 0,
        shippingAmount: 0,
        discountAmount: 0,
        paymentMethodId,
        customerName: '测试用户',
        customerEmail: 'test@example.com',
        shippingAddress: {
          name: '测试用户',
          phone: '1234567890',
          address: '测试地址',
          city: '测试城市',
          province: '测试省份',
          postalCode: '12345',
          country: '中国',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          paymentUrl: result.paymentUrl,
          qrCode: result.qrCode,
          transactionId: result.transactionId,
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('创建支付失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 验证支付状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('transactionId')
    const paymentMethodId = searchParams.get('paymentMethodId')

    if (!transactionId || !paymentMethodId) {
      return NextResponse.json(
        { success: false, error: '缺少必需参数' },
        { status: 400 }
      )
    }

    const result = await paymentService.verifyPayment(transactionId, paymentMethodId)

    return NextResponse.json({
      success: result.success,
      data: {
        status: result.status,
        amount: result.amount,
        currency: result.currency,
      },
      error: result.error,
    })
  } catch (error) {
    console.error('验证支付失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
