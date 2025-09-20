// 生产级数据库模型
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  passwordHash: string
  role: 'admin' | 'user' | 'merchant'
  status: 'active' | 'inactive' | 'suspended'
  emailVerified: boolean
  phoneVerified: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  
  // 财务信息
  balance: number
  totalEarnings: number
  totalWithdrawals: number
  totalOrders: number
  
  // 安全信息
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  loginAttempts: number
  lockedUntil?: Date
}

export interface PaymentMethod {
  id: string
  name: string
  type: 'jkopay' | 'alipay' | 'wechat' | 'stripe'
  config: Record<string, any>
  isActive: boolean
  feeRate: number
  minAmount: number
  maxAmount?: number
  supportedCurrencies: string[]
  createdAt: Date
  updatedAt: Date
}

export interface PaymentLink {
  id: string
  userId: string
  title: string
  description?: string
  amount: number
  currency: string
  paymentMethodId: string
  isActive: boolean
  expiresAt?: Date
  maxUses?: number
  usedCount: number
  successCount: number
  totalAmount: number
  
  // 安全设置
  requireAuth: boolean
  allowedEmails?: string[]
  ipWhitelist?: string[]
  
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  paymentLinkId?: string
  merchantId?: string
  
  // 订单信息
  orderNumber: string
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  totalAmount: number
  currency: string
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  
  // 支付信息
  paymentMethodId: string
  paymentId?: string
  transactionId?: string
  
  // 客户信息
  customerName: string
  customerEmail: string
  customerPhone?: string
  shippingAddress: Address
  
  // 时间戳
  createdAt: Date
  updatedAt: Date
  paidAt?: Date
  shippedAt?: Date
  deliveredAt?: Date
  cancelledAt?: Date
}

export interface Payment {
  id: string
  orderId: string
  userId: string
  paymentMethodId: string
  
  // 支付信息
  amount: number
  currency: string
  fee: number
  netAmount: number
  
  // 状态信息
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded'
  gatewayStatus?: string
  gatewayTransactionId?: string
  gatewayResponse?: Record<string, any>
  
  // 时间戳
  createdAt: Date
  updatedAt: Date
  processedAt?: Date
  failedAt?: Date
}

export interface Withdrawal {
  id: string
  userId: string
  amount: number
  fee: number
  netAmount: number
  
  // 提现信息
  method: 'bank' | 'alipay' | 'wechat'
  accountInfo: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled'
  
  // 审核信息
  reviewedBy?: string
  reviewedAt?: Date
  rejectReason?: string
  
  // 时间戳
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface Address {
  name: string
  phone: string
  address: string
  city: string
  province: string
  postalCode: string
  country: string
}

export interface AuditLog {
  id: string
  userId?: string
  action: string
  resource: string
  resourceId: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  createdAt: Date
}

export interface SystemSettings {
  id: string
  key: string
  value: any
  description?: string
  isPublic: boolean
  updatedBy: string
  updatedAt: Date
}
