// 用户类型
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'user' | 'merchant';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  balance: number; // 账户余额
  totalEarnings: number; // 总收益
  totalWithdrawals: number; // 总提现
}

// 支付方式
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'alipay' | 'wechat' | 'bank' | 'stripe' | 'paypal' | 'jkopay';
  config: Record<string, any>;
  isActive: boolean;
  feeRate: number; // 手续费率
}

// 订单状态
export type OrderStatus = 
  | 'pending'      // 待支付
  | 'paid'         // 已支付
  | 'processing'   // 处理中
  | 'shipped'      // 已发货
  | 'delivered'    // 已送达
  | 'cancelled'    // 已取消
  | 'refunded';    // 已退款

// 订单
export interface Order {
  id: string;
  userId: string;
  merchantId?: string; // 如果是商户订单
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentId?: string;
  status: OrderStatus;
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

// 订单项
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

// 地址
export interface Address {
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

// 支付记录
export interface Payment {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  transactionId?: string;
  gatewayResponse?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// 提现申请
export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  fee: number; // 手续费
  netAmount: number; // 实际到账金额
  method: 'bank' | 'alipay' | 'wechat';
  accountInfo: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

// 财务报表
export interface FinancialReport {
  id: string;
  userId?: string; // 如果为空，则为全平台报表
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  period: string; // 如 "2024-12"
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalWithdrawals: number;
  platformFee: number;
  netProfit: number;
  createdAt: Date;
}

// 扣费规则
export interface FeeRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number; // 百分比或固定金额
  minAmount?: number; // 最小金额
  maxAmount?: number; // 最大金额
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 收款链接
export interface PaymentLink {
  id: string;
  userId: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  isActive: boolean;
  expiresAt?: Date;
  maxUses?: number;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
