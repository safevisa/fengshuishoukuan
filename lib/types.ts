export interface User {
  id: string
  name: string
  email: string
  password: string
  phone?: string
  role: 'admin' | 'user' | 'merchant'
  userType?: 'self_registered' | 'admin_created' | 'dashboard_user'
  status: 'active' | 'suspended' | 'pending'
  balance?: number
  totalEarnings?: number
  totalWithdrawals?: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  userName?: string
  userEmail?: string
  amount: number
  description?: string
  status: 'pending' | 'completed' | 'cancelled' | 'Order Timeout' | 'Payment Failed' | 'Processing'
  paymentLinkId?: string
  paymentMethod?: string
  transactionId?: string
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  orderId: string
  amount: string
  status: 'pending' | 'completed' | 'failed' | 'success'
  paymentMethod: string
  transactionId?: string
  currencyCode?: string
  respCode?: string
  respMsg?: string
  createdAt: Date
  updatedAt: Date
}

export interface PaymentLink {
  id: string
  userId: string
  userName?: string
  userEmail?: string
  amount: string
  description: string
  status: 'active' | 'completed' | 'expired' | 'failed'
  paymentUrl?: string
  paymentMethod: string
  transactionId?: string | null
  // 新增字段
  productImage?: string | null
  maxUses: number
  usedCount: number
  isSingleUse: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Withdrawal {
  id: string
  userId: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  fee?: number
  netAmount?: number
  bankAccount?: string
  requestDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface FinancialReport {
  totalSales: number
  totalOrders: number
  platformFee: number
  netRevenue: number
  totalUsers: number
  totalPayments: number
  totalPaymentLinks: number
  generatedAt: string
}

export interface ReconciliationReport {
  dailyStats: Array<{
    date: string
    totalOrders: number
    totalAmount: number
    completedOrders: number
    completedAmount: number
  }>
  totalOrders: number
  totalAmount: number
  completedOrders: number
  completedAmount: number
  generatedAt: string
}

export interface UserPaymentDetails {
  user: User
  paymentLinks: PaymentLink[]
  orders: Order[]
  payments: Payment[]
  summary: {
    totalOrders: number
    totalAmount: number
    successfulPayments: number
    successAmount: number
  }
  dailyStats: Array<{
    date: string
    amount: number
    count: number
  }>
  paymentLinkStats: Array<{
    linkId: string
    description: string
    amount: string
    status: string
    orderCount: number
    paymentCount: number
    successCount: number
    successAmount: number
  }>
}