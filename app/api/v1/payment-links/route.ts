import { NextRequest, NextResponse } from 'next/server'
import { ProductionPaymentService } from '@/lib/payment/production-payment'
import { PaymentLink } from '@/lib/database/models'

const paymentService = new ProductionPaymentService()

// 创建收款链接
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, amount, currency, paymentMethodId, expiresAt, maxUses } = body

    // 验证必需字段
    if (!title || !amount || !currency || !paymentMethodId) {
      return NextResponse.json(
        { success: false, error: '缺少必需字段' },
        { status: 400 }
      )
    }

    // 验证金额
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: '金额必须大于0' },
        { status: 400 }
      )
    }

    // 创建收款链接
    const paymentLink: PaymentLink = {
      id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current_user_id', // 从JWT token中获取
      title,
      description,
      amount,
      currency,
      paymentMethodId,
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      maxUses,
      usedCount: 0,
      successCount: 0,
      totalAmount: 0,
      requireAuth: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // 这里应该保存到数据库
    // await db.paymentLinks.create(paymentLink)

    return NextResponse.json({
      success: true,
      data: {
        id: paymentLink.id,
        title: paymentLink.title,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        paymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pay/${paymentLink.id}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${process.env.NEXT_PUBLIC_APP_URL}/pay/${paymentLink.id}`,
        expiresAt: paymentLink.expiresAt,
        maxUses: paymentLink.maxUses,
        usedCount: paymentLink.usedCount,
      }
    })
  } catch (error) {
    console.error('创建收款链接失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 获取收款链接列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const userId = 'current_user_id' // 从JWT token中获取

    // 这里应该从数据库查询
    // const paymentLinks = await db.paymentLinks.findMany({
    //   where: { userId },
    //   skip: (page - 1) * limit,
    //   take: limit,
    //   orderBy: { createdAt: 'desc' }
    // })

    // 模拟数据
    const paymentLinks = []

    return NextResponse.json({
      success: true,
      data: {
        paymentLinks,
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        }
      }
    })
  } catch (error) {
    console.error('获取收款链接失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
