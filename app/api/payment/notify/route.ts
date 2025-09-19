import { NextRequest, NextResponse } from 'next/server'
import { paymentService } from '@/lib/payment'
import { db } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证街口支付通知签名
    const { transaction_id, status, amount, signature } = body
    
    if (!transaction_id || !status) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 这里应该验证签名
    // const isValidSignature = verifyJKOPaySignature(body)
    // if (!isValidSignature) {
    //   return NextResponse.json(
    //     { success: false, error: '签名验证失败' },
    //     { status: 400 }
    //   )
    // }

    // 查找对应的支付记录
    const payments = Array.from(db['payments'].values())
    const payment = payments.find(p => p.transactionId === transaction_id)
    
    if (!payment) {
      return NextResponse.json(
        { success: false, error: '支付记录不存在' },
        { status: 404 }
      )
    }

    // 更新支付状态
    if (status === 'SUCCESS') {
      await paymentService.verifyPayment(payment.id)
    } else if (status === 'FAILED') {
      db.updatePaymentStatus(payment.id, 'failed')
    }

    // 返回成功响应给街口支付
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('街口支付通知处理错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 验证街口支付签名
function verifyJKOPaySignature(data: Record<string, any>): boolean {
  // 这里应该实现街口支付的签名验证逻辑
  // 为了演示，我们返回true
  return true
}
