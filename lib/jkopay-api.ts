// 街口支付API集成服务
// 基于Suntone Gateway的街口支付接口

interface JKOPayConfig {
  apiUrl: string
  merchantId: string
  terminalId: string
  secretKey: string
  returnUrl: string
  notifyUrl: string
}

interface PaymentRequest {
  orderId: string
  amount: number // 台币金额（分）
  description: string
  customerInfo?: {
    name?: string
    email?: string
    phone?: string
  }
}

// 街口支付API请求参数
interface JKOPayRequest {
  merchantId: string
  terminalId: string
  orderId: string
  amount: number
  currency: string
  description: string
  returnUrl: string
  notifyUrl: string
  timestamp: string
  signature: string
}

interface PaymentResponse {
  success: boolean
  paymentUrl?: string
  transactionId?: string
  error?: string
  message?: string
}

interface PaymentStatus {
  transactionId: string
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  amount: number
  currency: string
  orderId: string
  paidAt?: string
  failureReason?: string
}

class JKOPayService {
  private config: JKOPayConfig

  constructor(config: JKOPayConfig) {
    this.config = config
  }

  // 创建支付订单
  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('🚀 创建街口支付订单:', paymentRequest)
      
      // 通过后端API创建支付订单
      const response = await fetch('/api/jkopay/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentRequest)
      })

      const result = await response.json()
      console.log('📥 街口支付API响应:', result)
      console.log('📥 响应状态码:', response.status)
      console.log('📥 result.success:', result.success)
      console.log('📥 result.error:', result.error)

      return {
        success: result.success,
        paymentUrl: result.paymentUrl,
        transactionId: result.transactionId,
        message: result.message,
        error: result.error
      }

    } catch (error) {
      console.error('❌ 街口支付订单创建失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建支付订单失败'
      }
    }
  }

  // 查询支付状态
  async queryPaymentStatus(transactionId: string): Promise<PaymentStatus | null> {
    try {
      console.log('🔍 查询街口支付状态:', transactionId)
      
      // 这里等待用户提供API地址后进行实际调用
      // 目前返回模拟数据
      const mockStatus: PaymentStatus = {
        transactionId,
        status: 'success',
        amount: 10000, // 100台币
        currency: 'TWD',
        orderId: 'order_' + Date.now(),
        paidAt: new Date().toISOString()
      }

      console.log('✅ 街口支付状态查询成功:', mockStatus)
      return mockStatus

    } catch (error) {
      console.error('❌ 街口支付状态查询失败:', error)
      return null
    }
  }

  // 验证支付回调
  async verifyCallback(callbackData: any): Promise<boolean> {
    try {
      console.log('🔐 验证街口支付回调:', callbackData)
      
      // 这里需要根据街口支付的实际回调格式进行验证
      // 包括签名验证等安全措施
      
      return true // 模拟验证成功

    } catch (error) {
      console.error('❌ 街口支付回调验证失败:', error)
      return false
    }
  }

  // 生成签名（根据街口支付文档实现）
  private generateSignature(data: any): string {
    // 根据街口支付API文档，签名算法通常为：
    // 1. 将参数按key排序
    // 2. 拼接成字符串
    // 3. 加上密钥
    // 4. MD5或SHA256加密
    
    const sortedKeys = Object.keys(data).sort()
    const signString = sortedKeys
      .map(key => `${key}=${data[key]}`)
      .join('&') + `&key=${this.config.secretKey}`
    
    console.log('🔐 签名原始字符串:', signString)
    
    // 使用MD5加密（根据API文档调整）
    const signature = this.md5(signString)
    console.log('🔐 生成签名:', signature)
    
    return signature
  }

  // MD5加密函数
  private md5(str: string): string {
    // 简单的MD5实现，生产环境建议使用crypto-js库
    const crypto = require('crypto')
    return crypto.createHash('md5').update(str, 'utf8').digest('hex').toUpperCase()
  }

  // 测试API连接
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 测试街口支付API连接...')
      
      // 通过后端API测试连接
      const response = await fetch('/api/jkopay/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      console.log('API连接测试结果:', result)

      return {
        success: result.success,
        message: result.message
      }

    } catch (error) {
      console.error('❌ 街口支付API连接测试失败:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'API连接测试失败'
      }
    }
  }
}

// 创建街口支付服务实例
export const jkopayService = new JKOPayService({
  apiUrl: process.env.JKOPAY_API_URL || 'https://gateway.suntone.com/payment/api/gotoPayment',
  merchantId: process.env.JKOPAY_MERCHANT_ID || '1888',
  terminalId: process.env.JKOPAY_TERMINAL_ID || '888506',
  secretKey: process.env.JKOPAY_SECRET_KEY || 'fe5b2c5ea084426bb1f6269acbac902f',
  returnUrl: process.env.JKOPAY_RETURN_URL || 'https://jinshiying.com/payment/return',
  notifyUrl: process.env.JKOPAY_NOTIFY_URL || 'https://jinshiying.com/api/payment/notify'
})

export type { PaymentRequest, PaymentResponse, PaymentStatus, JKOPayConfig }
