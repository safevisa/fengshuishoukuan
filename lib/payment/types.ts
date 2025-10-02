// 支付方式类型定义
export type PaymentMethod = 'jkopay' | 'stripe' | 'paypal' | 'alipay' | 'wechat' | 'razorpay' | 'square' | 'adyen';

// 支付状态
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

// 货币代码
export type CurrencyCode = 'TWD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'HKD' | 'SGD' | 'AUD' | 'CAD';

// 地区代码
export type RegionCode = 'TW' | 'US' | 'EU' | 'GB' | 'JP' | 'CN' | 'HK' | 'SG' | 'AU' | 'CA';

// 支付配置接口
export interface PaymentConfig {
  method: PaymentMethod;
  region: RegionCode;
  currency: CurrencyCode;
  isEnabled: boolean;
  credentials: Record<string, string>;
  endpoints: {
    create: string;
    callback: string;
    return: string;
  };
  features: {
    supportsRefund: boolean;
    supportsPartialRefund: boolean;
    supportsWebhook: boolean;
    supports3DS: boolean;
  };
}

// 支付请求参数
export interface PaymentRequest {
  orderNo: string;
  amount: number;
  currency: CurrencyCode;
  description: string;
  customerInfo: {
    name?: string;
    email?: string;
    phone?: string;
    ip?: string;
    address?: {
      country: string;
      state: string;
      city: string;
      address: string;
      zipCode: string;
    };
  };
  goodsInfo?: Array<{
    goodsID: string;
    goodsName: string;
    quantity: string;
    goodsPrice: string;
  }>;
  metadata?: Record<string, string>;
}

// 支付响应
export interface PaymentResponse {
  success: boolean;
  orderNo: string;
  respCode: string;
  respMsg: string;
  paymentUrl?: string;
  amount: number;
  currency: CurrencyCode;
  tradeNo?: string;
  transactionId?: string;
  metadata?: Record<string, any>;
}

// 支付回调数据
export interface PaymentCallback {
  orderNo: string;
  respCode: string;
  respMsg: string;
  amount: string;
  currency: CurrencyCode;
  tradeNo?: string;
  transactionId?: string;
  status: PaymentStatus;
  signature?: string;
  metadata?: Record<string, any>;
}

// 支付服务接口
export interface PaymentService {
  method: PaymentMethod;
  region: RegionCode;
  currency: CurrencyCode;
  
  // 创建支付
  createPayment(request: PaymentRequest): Promise<PaymentResponse>;
  
  // 验证回调签名
  verifyCallback(callback: PaymentCallback): boolean;
  
  // 处理回调
  handleCallback(callback: PaymentCallback): Promise<{
    success: boolean;
    orderId: string;
    status: PaymentStatus;
    amount: number;
    transactionId?: string;
  }>;
  
  // 退款
  refund?(transactionId: string, amount: number, reason?: string): Promise<{
    success: boolean;
    refundId?: string;
    message?: string;
  }>;
  
  // 查询支付状态
  queryPayment?(orderNo: string): Promise<{
    success: boolean;
    status: PaymentStatus;
    amount?: number;
    transactionId?: string;
  }>;
}

// 支付工厂配置
export interface PaymentFactoryConfig {
  [key: string]: PaymentConfig;
}
