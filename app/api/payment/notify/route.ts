import { NextRequest, NextResponse } from 'next/server'
import { JKOPayResponse } from '@/lib/jkopay-types'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 收到街口支付异步通知')
    
    // 获取请求体
    const body = await request.text()
    console.log('通知内容:', body)
    
    // 解析表单数据
    const params = new URLSearchParams(body)
    const notifyData: Partial<JKOPayResponse> = {}
    
    // 提取所有参数
    for (const [key, value] of params.entries()) {
      (notifyData as any)[key] = value
    }
    
    console.log('解析后的通知数据:', notifyData)
    
    // 验证必要字段
    if (!notifyData.orderNo || !notifyData.respCode) {
      console.error('❌ 通知数据缺少必要字段')
      return NextResponse.json({ success: false, error: '缺少必要字段' }, { status: 400 })
    }
    
    // 验证签名（可选，根据实际需求）
    // const expectedHash = generateHash(notifyData)
    // if (notifyData.hashcode !== expectedHash) {
    //   console.error('❌ 签名验证失败')
    //   return NextResponse.json({ success: false, error: '签名验证失败' }, { status: 400 })
    // }
    
    // 处理支付结果
    const orderNo = notifyData.orderNo
    const respCode = notifyData.respCode
    const respMsg = notifyData.respMsg || ''
    const tradeNo = notifyData.tradeNo || ''
    const amount = notifyData.amount || ''
    
    console.log(`📊 订单 ${orderNo} 支付结果: ${respCode} - ${respMsg}`)
    
    // 根据响应码处理不同状态
    switch (respCode) {
      case '00':
      case '0000':
        // 支付成功
        console.log(`✅ 订单 ${orderNo} 支付成功`)
        // 这里可以更新订单状态、发送确认邮件等
        await handlePaymentSuccess(orderNo, tradeNo, amount, notifyData)
        break
        
      case '003':
        // 待处理
        console.log(`⏳ 订单 ${orderNo} 待处理`)
        await handlePaymentPending(orderNo, tradeNo, amount, notifyData)
        break
        
      case '01':
      default:
        // 支付失败
        console.log(`❌ 订单 ${orderNo} 支付失败: ${respMsg}`)
        await handlePaymentFailure(orderNo, tradeNo, amount, respMsg, notifyData)
        break
    }
    
    // 返回成功响应给街口支付
    return NextResponse.json({ 
      success: true, 
      message: '通知处理成功',
      orderNo,
      respCode 
    })
    
  } catch (error) {
    console.error('❌ 处理支付通知失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: '处理通知失败' 
    }, { status: 500 })
  }
}

// 处理支付成功
async function handlePaymentSuccess(orderNo: string, tradeNo: string, amount: string, notifyData: any) {
  try {
    // 更新订单状态为已支付
    console.log(`💰 订单 ${orderNo} 支付成功，金额: ${amount}，交易号: ${tradeNo}`)
    
    // 这里可以：
    // 1. 更新数据库中的订单状态
    // 2. 发送支付成功邮件给用户
    // 3. 更新库存
    // 4. 触发后续业务流程
    
    // 示例：更新本地存储（实际项目中应该更新数据库）
    if (typeof window !== 'undefined') {
      const orders = JSON.parse(localStorage.getItem('fengshui_orders') || '[]')
      const orderIndex = orders.findIndex((order: any) => order.id === orderNo)
      if (orderIndex !== -1) {
        orders[orderIndex].status = 'paid'
        orders[orderIndex].paymentId = tradeNo
        orders[orderIndex].paidAt = new Date().toISOString()
        localStorage.setItem('fengshui_orders', JSON.stringify(orders))
      }
    }
    
  } catch (error) {
    console.error('处理支付成功失败:', error)
  }
}

// 处理支付待处理
async function handlePaymentPending(orderNo: string, tradeNo: string, amount: string, notifyData: any) {
  try {
    console.log(`⏳ 订单 ${orderNo} 待处理，金额: ${amount}，交易号: ${tradeNo}`)
    
    // 更新订单状态为待处理
    if (typeof window !== 'undefined') {
      const orders = JSON.parse(localStorage.getItem('fengshui_orders') || '[]')
      const orderIndex = orders.findIndex((order: any) => order.id === orderNo)
      if (orderIndex !== -1) {
        orders[orderIndex].status = 'pending'
        orders[orderIndex].paymentId = tradeNo
        orders[orderIndex].updatedAt = new Date().toISOString()
        localStorage.setItem('fengshui_orders', JSON.stringify(orders))
      }
    }
    
  } catch (error) {
    console.error('处理支付待处理失败:', error)
  }
}

// 处理支付失败
async function handlePaymentFailure(orderNo: string, tradeNo: string, amount: string, errorMsg: string, notifyData: any) {
  try {
    console.log(`❌ 订单 ${orderNo} 支付失败，金额: ${amount}，错误: ${errorMsg}`)
    
    // 更新订单状态为支付失败
    if (typeof window !== 'undefined') {
      const orders = JSON.parse(localStorage.getItem('fengshui_orders') || '[]')
      const orderIndex = orders.findIndex((order: any) => order.id === orderNo)
      if (orderIndex !== -1) {
        orders[orderIndex].status = 'failed'
        orders[orderIndex].paymentId = tradeNo
        orders[orderIndex].errorMessage = errorMsg
        orders[orderIndex].updatedAt = new Date().toISOString()
        localStorage.setItem('fengshui_orders', JSON.stringify(orders))
      }
    }
    
  } catch (error) {
    console.error('处理支付失败失败:', error)
  }
}

// 生成签名验证（可选）
function generateHash(data: any): string {
  // 根据街口支付的签名规则生成签名
  // 这里需要根据实际API文档实现
  return ''
}