import { config } from '../config'
import { PaymentLink, Order, Payment, PaymentMethod } from '../database/models'

// 支付网关接口
export interface PaymentGateway {
  createPayment(payment: Payment, order: Order): Promise<PaymentResult>
  verifyPayment(transactionId: string): Promise<VerificationResult>
  refundPayment(transactionId: string, amount: number, reason?: string): Promise<RefundResult>
  queryPayment(transactionId: string): Promise<QueryResult>
}

export interface PaymentResult {
  success: boolean
  paymentUrl?: string
  qrCode?: string
  transactionId?: string
  error?: string
  errorCode?: string
}

export interface VerificationResult {
  success: boolean
  status: 'success' | 'pending' | 'failed'
  amount?: number
  currency?: string
  error?: string
}

export interface RefundResult {
  success: boolean
  refundId?: string
  amount?: number
  error?: string
}

export interface QueryResult {
  success: boolean
  status: 'success' | 'pending' | 'failed'
  amount?: number
  currency?: string
  error?: string
}

// 街口支付生产级实现
export class JKOPayProductionGateway implements PaymentGateway {
  private config = config.payment.jkopay

  async createPayment(payment: Payment, order: Order): Promise<PaymentResult> {
    try {
      const paymentData = {
        merchant_id: this.config.merchantId,
        order_no: order.orderNumber,
        amount: Math.round(payment.amount * 100), // 转换为分
        currency: payment.currency,
        product_name: order.orderNumber,
        product_description: `订单 ${order.orderNumber}`,
        return_url: this.config.returnUrl,
        notify_url: this.config.notifyUrl,
        timestamp: Math.floor(Date.now() / 1000),
        nonce: this.generateNonce(),
        client_ip: this.getClientIP(),
      }

      // 生成签名
      const signature = this.generateSignature(paymentData)
      paymentData['signature'] = signature

      const response = await fetch(`${this.config.apiUrl}/api/v1/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Merchant-ID': this.config.merchantId,
        },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (result.code === '0000') {
        return {
          success: true,
          paymentUrl: result.data.payment_url,
          qrCode: result.data.qr_code,
          transactionId: result.data.transaction_id,
        }
      } else {
        return {
          success: false,
          error: result.message || '支付创建失败',
          errorCode: result.code,
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '支付服务异常',
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<VerificationResult> {
    try {
      const queryData = {
        transaction_id: transactionId,
        timestamp: Math.floor(Date.now() / 1000),
        nonce: this.generateNonce(),
      }

      const signature = this.generateSignature(queryData)
      queryData['signature'] = signature

      const response = await fetch(`${this.config.apiUrl}/api/v1/payment/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Merchant-ID': this.config.merchantId,
        },
        body: JSON.stringify(queryData),
      })

      const result = await response.json()

      if (result.code === '0000') {
        return {
          success: true,
          status: result.data.status === 'SUCCESS' ? 'success' : 
                  result.data.status === 'PENDING' ? 'pending' : 'failed',
          amount: result.data.amount ? result.data.amount / 100 : undefined,
          currency: result.data.currency,
        }
      } else {
        return {
          success: false,
          status: 'failed',
          error: result.message || '支付验证失败',
        }
      }
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : '支付验证异常',
      }
    }
  }

  async refundPayment(transactionId: string, amount: number, reason?: string): Promise<RefundResult> {
    try {
      const refundData = {
        transaction_id: transactionId,
        refund_amount: Math.round(amount * 100),
        refund_reason: reason || '用户申请退款',
        timestamp: Math.floor(Date.now() / 1000),
        nonce: this.generateNonce(),
      }

      const signature = this.generateSignature(refundData)
      refundData['signature'] = signature

      const response = await fetch(`${this.config.apiUrl}/api/v1/payment/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Merchant-ID': this.config.merchantId,
        },
        body: JSON.stringify(refundData),
      })

      const result = await response.json()

      if (result.code === '0000') {
        return {
          success: true,
          refundId: result.data.refund_id,
          amount: result.data.refund_amount ? result.data.refund_amount / 100 : amount,
        }
      } else {
        return {
          success: false,
          error: result.message || '退款失败',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '退款服务异常',
      }
    }
  }

  async queryPayment(transactionId: string): Promise<QueryResult> {
    return this.verifyPayment(transactionId)
  }

  private generateSignature(data: Record<string, any>): string {
    const sortedKeys = Object.keys(data).sort()
    const signString = sortedKeys.map(key => `${key}=${data[key]}`).join('&')
    const signStringWithKey = `${signString}&key=${this.config.secretKey}`
    
    // 使用HMAC-SHA256生成签名
    const crypto = require('crypto')
    return crypto.createHmac('sha256', this.config.secretKey)
      .update(signStringWithKey)
      .digest('hex')
  }

  private generateNonce(): string {
    return Math.random().toString(36).substr(2, 15) + Date.now().toString(36)
  }

  private getClientIP(): string {
    // 在实际应用中，这应该从请求头中获取真实IP
    return '127.0.0.1'
  }
}

// 支付服务工厂
export class PaymentServiceFactory {
  static createGateway(method: string): PaymentGateway {
    switch (method) {
      case 'jkopay':
        return new JKOPayProductionGateway()
      // 可以添加其他支付方式
      default:
        throw new Error(`Unsupported payment method: ${method}`)
    }
  }
}

// 生产级支付服务
export class ProductionPaymentService {
  private gateways: Map<string, PaymentGateway> = new Map()

  constructor() {
    // 初始化支付网关
    this.gateways.set('jkopay', new JKOPayProductionGateway())
  }

  async createPaymentLink(paymentLink: PaymentLink, order: Order): Promise<PaymentResult> {
    const gateway = this.gateways.get(paymentLink.paymentMethodId)
    if (!gateway) {
      throw new Error(`Payment method not supported: ${paymentLink.paymentMethodId}`)
    }

    // 创建支付记录
    const payment: Payment = {
      id: this.generateId(),
      orderId: order.id,
      userId: order.userId,
      paymentMethodId: paymentLink.paymentMethodId,
      amount: paymentLink.amount,
      currency: paymentLink.currency,
      fee: paymentLink.amount * config.payment.jkopay.feeRate,
      netAmount: paymentLink.amount * (1 - config.payment.jkopay.feeRate),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return gateway.createPayment(payment, order)
  }

  async verifyPayment(transactionId: string, paymentMethodId: string): Promise<VerificationResult> {
    const gateway = this.gateways.get(paymentMethodId)
    if (!gateway) {
      throw new Error(`Payment method not supported: ${paymentMethodId}`)
    }

    return gateway.verifyPayment(transactionId)
  }

  async refundPayment(transactionId: string, amount: number, paymentMethodId: string, reason?: string): Promise<RefundResult> {
    const gateway = this.gateways.get(paymentMethodId)
    if (!gateway) {
      throw new Error(`Payment method not supported: ${paymentMethodId}`)
    }

    return gateway.refundPayment(transactionId, amount, reason)
  }

  private generateId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

