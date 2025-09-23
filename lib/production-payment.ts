// 生产环境支付处理
import crypto from 'crypto'

export interface JKOPayConfig {
  apiUrl: string
  merchantId: string
  terminalId: string
  secretKey: string
  returnUrl: string
  notifyUrl: string
}

export interface PaymentRequest {
  orderId: string
  amount: number
  currency: string
  description: string
  customerEmail: string
  customerPhone: string
}

export interface PaymentResponse {
  success: boolean
  paymentUrl?: string
  transactionId?: string
  message: string
  errorCode?: string
}

export class ProductionPaymentService {
  private config: JKOPayConfig

  constructor() {
    this.config = {
      apiUrl: process.env.JKOPAY_API_URL || 'https://gateway.suntone.com/payment/api/gotoPayment',
      merchantId: process.env.JKOPAY_MERCHANT_ID || '1888',
      terminalId: process.env.JKOPAY_TERMINAL_ID || '888506',
      secretKey: process.env.JKOPAY_SECRET_KEY || 'fe5b2c5ea084426bb1f6269acbac902f',
      returnUrl: process.env.JKOPAY_RETURN_URL || 'https://jinshiying.com/payment/return',
      notifyUrl: process.env.JKOPAY_NOTIFY_URL || 'https://jinshiying.com/api/payment/notify'
    }
  }

  // 生成签名
  private generateSignature(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    
    const signString = `${sortedParams}&key=${this.config.secretKey}`
    return crypto.createHash('sha256').update(signString).digest('hex').toUpperCase()
  }

  // 创建支付请求
  async createPaymentRequest(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const timestamp = Date.now().toString()
      const orderId = paymentData.orderId
      const amount = Math.round(paymentData.amount * 100) // 转换为分

      const params = {
        merchantId: this.config.merchantId,
        terminalId: this.config.terminalId,
        orderId: orderId,
        amount: amount.toString(),
        currency: paymentData.currency || 'CNY',
        description: paymentData.description,
        customerEmail: paymentData.customerEmail,
        customerPhone: paymentData.customerPhone,
        returnUrl: this.config.returnUrl,
        notifyUrl: this.config.notifyUrl,
        timestamp: timestamp
      }

      // 生成签名
      const signature = this.generateSignature(params)
      params['signature'] = signature

      // 发送支付请求
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.code === '0000' && result.data) {
        return {
          success: true,
          paymentUrl: result.data.paymentUrl,
          transactionId: result.data.transactionId,
          message: '支付请求创建成功'
        }
      } else {
        return {
          success: false,
          message: result.message || '支付请求创建失败',
          errorCode: result.code
        }
      }
    } catch (error) {
      console.error('Payment request error:', error)
      return {
        success: false,
        message: '支付请求创建失败，请重试',
        errorCode: 'PAYMENT_ERROR'
      }
    }
  }

  // 验证支付回调
  async verifyPaymentCallback(callbackData: Record<string, any>): Promise<boolean> {
    try {
      const { signature, ...params } = callbackData
      const expectedSignature = this.generateSignature(params)
      
      return signature === expectedSignature
    } catch (error) {
      console.error('Payment callback verification error:', error)
      return false
    }
  }

  // 查询支付状态
  async queryPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    try {
      const params = {
        merchantId: this.config.merchantId,
        terminalId: this.config.terminalId,
        transactionId: transactionId,
        timestamp: Date.now().toString()
      }

      const signature = this.generateSignature(params)
      params['signature'] = signature

      const response = await fetch(`${this.config.apiUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.code === '0000') {
        return {
          success: true,
          message: '支付状态查询成功',
          transactionId: result.data.transactionId
        }
      } else {
        return {
          success: false,
          message: result.message || '支付状态查询失败',
          errorCode: result.code
        }
      }
    } catch (error) {
      console.error('Payment status query error:', error)
      return {
        success: false,
        message: '支付状态查询失败，请重试',
        errorCode: 'QUERY_ERROR'
      }
    }
  }

  // 创建收款链接
  async createPaymentLink(linkData: {
    amount: number
    description: string
    customerEmail?: string
    customerPhone?: string
  }): Promise<{ success: boolean; linkId: string; paymentUrl: string; message: string }> {
    try {
      const linkId = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const orderId = `order_${linkId}`
      
      const paymentRequest: PaymentRequest = {
        orderId: orderId,
        amount: linkData.amount,
        currency: 'CNY',
        description: linkData.description,
        customerEmail: linkData.customerEmail || '',
        customerPhone: linkData.customerPhone || ''
      }

      const paymentResult = await this.createPaymentRequest(paymentRequest)
      
      if (paymentResult.success && paymentResult.paymentUrl) {
        return {
          success: true,
          linkId: linkId,
          paymentUrl: paymentResult.paymentUrl,
          message: '收款链接创建成功'
        }
      } else {
        return {
          success: false,
          linkId: linkId,
          paymentUrl: '',
          message: paymentResult.message
        }
      }
    } catch (error) {
      console.error('Payment link creation error:', error)
      return {
        success: false,
        linkId: '',
        paymentUrl: '',
        message: '收款链接创建失败，请重试'
      }
    }
  }
}

export const productionPaymentService = new ProductionPaymentService()

