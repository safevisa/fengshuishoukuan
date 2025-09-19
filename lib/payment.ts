import { Payment, PaymentMethod, Order, User } from './types';
import { db } from './database';

// 支付网关接口
interface PaymentGateway {
  createPayment(payment: Payment): Promise<{ success: boolean; paymentUrl?: string; transactionId?: string; error?: string }>;
  verifyPayment(transactionId: string): Promise<{ success: boolean; status: string; error?: string }>;
  refundPayment(transactionId: string, amount: number): Promise<{ success: boolean; refundId?: string; error?: string }>;
}

// 支付宝支付网关
class AlipayGateway implements PaymentGateway {
  constructor(private config: Record<string, any>) {}

  async createPayment(payment: Payment): Promise<{ success: boolean; paymentUrl?: string; transactionId?: string; error?: string }> {
    try {
      // 这里应该调用真实的支付宝API
      // 为了演示，我们返回模拟数据
      const transactionId = `alipay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        paymentUrl: `https://openapi.alipay.com/gateway.do?app_id=${this.config.appId}&method=alipay.trade.page.pay&...`,
        transactionId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '支付宝支付创建失败'
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<{ success: boolean; status: string; error?: string }> {
    try {
      // 这里应该调用支付宝的验证API
      // 模拟验证成功
      return {
        success: true,
        status: 'success'
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : '支付宝支付验证失败'
      };
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      // 这里应该调用支付宝的退款API
      const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        refundId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '支付宝退款失败'
      };
    }
  }
}

// 微信支付网关
class WechatGateway implements PaymentGateway {
  constructor(private config: Record<string, any>) {}

  async createPayment(payment: Payment): Promise<{ success: boolean; paymentUrl?: string; transactionId?: string; error?: string }> {
    try {
      const transactionId = `wechat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        paymentUrl: `weixin://wxpay/bizpayurl?pr=${transactionId}`,
        transactionId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '微信支付创建失败'
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<{ success: boolean; status: string; error?: string }> {
    try {
      return {
        success: true,
        status: 'success'
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : '微信支付验证失败'
      };
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        refundId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '微信退款失败'
      };
    }
  }
}

// Stripe支付网关
class StripeGateway implements PaymentGateway {
  constructor(private config: Record<string, any>) {}

  async createPayment(payment: Payment): Promise<{ success: boolean; paymentUrl?: string; transactionId?: string; error?: string }> {
    try {
      const transactionId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        paymentUrl: `https://checkout.stripe.com/pay/${transactionId}`,
        transactionId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe支付创建失败'
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<{ success: boolean; status: string; error?: string }> {
    try {
      return {
        success: true,
        status: 'success'
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Stripe支付验证失败'
      };
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        refundId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe退款失败'
      };
    }
  }
}

// 街口支付网关
class JKOPayGateway implements PaymentGateway {
  constructor(private config: Record<string, any>) {}

  async createPayment(payment: Payment): Promise<{ success: boolean; paymentUrl?: string; transactionId?: string; error?: string }> {
    try {
      const transactionId = `jkopay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 街口支付API调用
      const paymentData = {
        merchant_id: this.config.merchantId,
        order_no: payment.orderId,
        amount: Math.round(payment.amount * 100), // 转换为分
        currency: 'TWD',
        product_name: '風水擺件商品',
        return_url: `${this.config.returnUrl}?payment_id=${payment.id}`,
        notify_url: `${this.config.notifyUrl}`,
        timestamp: Math.floor(Date.now() / 1000),
        nonce: Math.random().toString(36).substr(2, 15)
      };

      // 生成签名
      const signature = this.generateSignature(paymentData);
      paymentData['signature'] = signature;

      // 调用街口支付API
      const response = await fetch(`${this.config.apiUrl}/api/v1/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (result.code === '0000') {
        return {
          success: true,
          paymentUrl: result.data.payment_url,
          transactionId: result.data.transaction_id
        };
      } else {
        return {
          success: false,
          error: result.message || '街口支付创建失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '街口支付创建失败'
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<{ success: boolean; status: string; error?: string }> {
    try {
      // 查询支付状态
      const response = await fetch(`${this.config.apiUrl}/api/v1/payment/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          timestamp: Math.floor(Date.now() / 1000),
          nonce: Math.random().toString(36).substr(2, 15)
        })
      });

      const result = await response.json();

      if (result.code === '0000') {
        return {
          success: true,
          status: result.data.status === 'SUCCESS' ? 'success' : 'pending'
        };
      } else {
        return {
          success: false,
          status: 'failed',
          error: result.message || '街口支付验证失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : '街口支付验证失败'
      };
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const refundData = {
        transaction_id: transactionId,
        refund_amount: Math.round(amount * 100), // 转换为分
        timestamp: Math.floor(Date.now() / 1000),
        nonce: Math.random().toString(36).substr(2, 15)
      };

      const signature = this.generateSignature(refundData);
      refundData['signature'] = signature;

      const response = await fetch(`${this.config.apiUrl}/api/v1/payment/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(refundData)
      });

      const result = await response.json();

      if (result.code === '0000') {
        return {
          success: true,
          refundId: result.data.refund_id
        };
      } else {
        return {
          success: false,
          error: result.message || '街口支付退款失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '街口支付退款失败'
      };
    }
  }

  private generateSignature(data: Record<string, any>): string {
    // 街口支付签名算法
    const sortedKeys = Object.keys(data).sort();
    const signString = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
    const signStringWithKey = `${signString}&key=${this.config.secretKey}`;
    
    // 这里应该使用HMAC-SHA256或其他加密算法
    // 为了演示，我们使用简单的hash
    return Buffer.from(signStringWithKey).toString('base64');
  }
}

// 支付服务类
export class PaymentService {
  private gateways: Map<string, PaymentGateway> = new Map();

  constructor() {
    this.initializeGateways();
  }

  private initializeGateways() {
    const paymentMethods = db.getPaymentMethods();
    
    paymentMethods.forEach(method => {
      let gateway: PaymentGateway;
      
      switch (method.type) {
        case 'alipay':
          gateway = new AlipayGateway(method.config);
          break;
        case 'wechat':
          gateway = new WechatGateway(method.config);
          break;
        case 'stripe':
          gateway = new StripeGateway(method.config);
          break;
        case 'jkopay':
          gateway = new JKOPayGateway(method.config);
          break;
        default:
          return;
      }
      
      this.gateways.set(method.id, gateway);
    });
  }

  // 创建支付
  async createPayment(order: Order, paymentMethodId: string): Promise<{ success: boolean; paymentUrl?: string; paymentId?: string; error?: string }> {
    try {
      const paymentMethod = db.getPaymentMethods().find(m => m.id === paymentMethodId);
      if (!paymentMethod) {
        return { success: false, error: '支付方式不存在' };
      }

      const gateway = this.gateways.get(paymentMethodId);
      if (!gateway) {
        return { success: false, error: '支付网关未配置' };
      }

      // 计算手续费
      const fee = db.calculateFee(order.totalAmount, 'fee-001');
      const totalAmount = order.totalAmount + fee;

      // 创建支付记录
      const payment: Payment = {
        id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        orderId: order.id,
        userId: order.userId,
        amount: totalAmount,
        currency: 'CNY',
        method: paymentMethodId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const createdPayment = db.createPayment(payment);

      // 调用支付网关
      const result = await gateway.createPayment(createdPayment);

      if (result.success) {
        // 更新支付记录
        db.updatePaymentStatus(createdPayment.id, 'pending');
        
        return {
          success: true,
          paymentUrl: result.paymentUrl,
          paymentId: createdPayment.id
        };
      } else {
        return {
          success: false,
          error: result.error || '支付创建失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '支付服务错误'
      };
    }
  }

  // 验证支付
  async verifyPayment(paymentId: string): Promise<{ success: boolean; status: string; error?: string }> {
    try {
      const payment = db.getPaymentById(paymentId);
      if (!payment) {
        return { success: false, error: '支付记录不存在' };
      }

      const paymentMethod = db.getPaymentMethods().find(m => m.id === payment.method);
      if (!paymentMethod) {
        return { success: false, error: '支付方式不存在' };
      }

      const gateway = this.gateways.get(payment.method);
      if (!gateway) {
        return { success: false, error: '支付网关未配置' };
      }

      if (!payment.transactionId) {
        return { success: false, error: '交易ID不存在' };
      }

      const result = await gateway.verifyPayment(payment.transactionId);

      if (result.success) {
        // 更新支付状态
        db.updatePaymentStatus(paymentId, 'success');
        
        // 更新订单状态
        const order = db.getOrderById(payment.orderId);
        if (order) {
          db.updateOrderStatus(order.id, 'paid');
          
          // 更新用户余额（如果是商户订单）
          if (order.merchantId) {
            const merchant = db.getUserById(order.merchantId);
            if (merchant) {
              const platformFee = db.calculateFee(order.totalAmount, 'fee-001');
              const merchantEarnings = order.totalAmount - platformFee;
              
              db.updateUser(merchant.id, {
                balance: merchant.balance + merchantEarnings,
                totalEarnings: merchant.totalEarnings + merchantEarnings
              });
            }
          }
        }
      } else {
        db.updatePaymentStatus(paymentId, 'failed');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : '支付验证失败'
      };
    }
  }

  // 退款
  async refundPayment(paymentId: string, amount?: number): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const payment = db.getPaymentById(paymentId);
      if (!payment) {
        return { success: false, error: '支付记录不存在' };
      }

      if (payment.status !== 'success') {
        return { success: false, error: '只能退款已成功的支付' };
      }

      const paymentMethod = db.getPaymentMethods().find(m => m.id === payment.method);
      if (!paymentMethod) {
        return { success: false, error: '支付方式不存在' };
      }

      const gateway = this.gateways.get(payment.method);
      if (!gateway) {
        return { success: false, error: '支付网关未配置' };
      }

      if (!payment.transactionId) {
        return { success: false, error: '交易ID不存在' };
      }

      const refundAmount = amount || payment.amount;
      const result = await gateway.refundPayment(payment.transactionId, refundAmount);

      if (result.success) {
        // 更新支付状态
        db.updatePaymentStatus(paymentId, 'cancelled');
        
        // 更新订单状态
        const order = db.getOrderById(payment.orderId);
        if (order) {
          db.updateOrderStatus(order.id, 'refunded');
        }
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '退款失败'
      };
    }
  }

  // 获取支付方式
  getPaymentMethods(): PaymentMethod[] {
    return db.getPaymentMethods();
  }
}

// 导出单例实例
export const paymentService = new PaymentService();
