export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentLinkId?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId?: string;
  currencyCode?: string;
  respCode?: string;
  respMsg?: string;
  merNo?: string;
  terNo?: string;
  transType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentLink {
  id: string;
  userId: string;
  amount: number;
  description: string;
  status: 'active' | 'completed' | 'failed' | 'expired';
  paymentUrl: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialReport {
  totalSales: number;
  totalOrders: number;
  platformFee: number;
  netRevenue: number;
  totalUsers: number;
  totalPayments: number;
  totalPaymentLinks: number;
  generatedAt: Date;
}

export interface ReconciliationReport {
  totalOrders: number;
  totalPayments: number;
  totalAmount: number;
  dailyData: Array<{
    date: string;
    orders: number;
    payments: number;
    totalAmount: number;
  }>;
  generatedAt: Date;
}

