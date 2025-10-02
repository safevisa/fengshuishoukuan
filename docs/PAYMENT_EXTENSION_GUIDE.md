# 支付方式扩展指南

## 概述

本系统采用模块化的支付架构，支持轻松扩展新的支付方式。当前已集成街口支付（台湾），并预留了Stripe、PayPal、支付宝等支付方式的扩展接口。

## 架构设计

### 1. 核心组件

- **PaymentService**: 支付服务接口，定义所有支付方式必须实现的方法
- **PaymentFactory**: 支付服务工厂，管理不同支付方式的实例
- **PaymentManager**: 支付管理器，提供统一的支付操作接口
- **PaymentConfig**: 支付配置，定义各支付方式的参数和特性

### 2. 支持的功能

- 创建支付
- 验证回调签名
- 处理支付回调
- 退款（可选）
- 查询支付状态（可选）

## 已集成的支付方式

### 街口支付 (JkoPay) - 台湾
- **地区**: TW
- **货币**: TWD
- **特性**: 支持3DS、Webhook
- **状态**: ✅ 已实现

### 预留的支付方式

#### Stripe - 美国/欧洲
- **地区**: US, EU
- **货币**: USD, EUR, GBP
- **特性**: 支持退款、部分退款、3DS、Webhook
- **状态**: 🔄 预留接口

#### PayPal - 全球
- **地区**: 全球
- **货币**: USD, EUR, GBP, JPY, CAD, AUD
- **特性**: 支持退款、部分退款、Webhook
- **状态**: 🔄 预留接口

#### 支付宝 - 中国
- **地区**: CN
- **货币**: CNY
- **特性**: 支持退款、部分退款、Webhook
- **状态**: 🔄 预留接口

## 如何添加新的支付方式

### 步骤1: 创建支付服务类

在 `lib/payment/providers/` 目录下创建新的支付服务类：

```typescript
// lib/payment/providers/your-payment.ts
import { PaymentService, PaymentRequest, PaymentResponse, PaymentCallback } from '../types';

export class YourPaymentService implements PaymentService {
  public readonly method: PaymentMethod = 'your_payment';
  public readonly region: RegionCode = 'XX';
  public readonly currency: CurrencyCode = 'XXX';
  
  private config: PaymentConfig;

  constructor(config: PaymentConfig) {
    this.config = config;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // 实现创建支付逻辑
  }

  verifyCallback(callback: PaymentCallback): boolean {
    // 实现回调签名验证
  }

  async handleCallback(callback: PaymentCallback): Promise<{
    success: boolean;
    orderId: string;
    status: 'completed' | 'failed' | 'pending';
    amount: number;
    transactionId?: string;
  }> {
    // 实现回调处理逻辑
  }

  // 可选方法
  async refund?(transactionId: string, amount: number, reason?: string) {
    // 实现退款逻辑
  }

  async queryPayment?(orderNo: string) {
    // 实现查询支付状态逻辑
  }
}
```

### 步骤2: 更新支付配置

在 `lib/payment/config.ts` 中添加新支付方式的配置：

```typescript
export const paymentConfig: PaymentFactoryConfig = {
  // ... 现有配置
  
  your_payment: {
    method: 'your_payment',
    region: 'XX',
    currency: 'XXX',
    isEnabled: true,
    credentials: {
      // 支付方式特定的凭据
      apiKey: process.env.YOUR_PAYMENT_API_KEY || '',
      secretKey: process.env.YOUR_PAYMENT_SECRET_KEY || '',
    },
    endpoints: {
      create: process.env.YOUR_PAYMENT_CREATE_URL || 'https://api.yourpayment.com/create',
      callback: process.env.YOUR_PAYMENT_CALLBACK_URL || 'https://jinshiying.com/api/your-payment/callback',
      return: process.env.YOUR_PAYMENT_RETURN_URL || 'https://jinshiying.com/payment/return'
    },
    features: {
      supportsRefund: true,
      supportsPartialRefund: true,
      supportsWebhook: true,
      supports3DS: false
    }
  }
};
```

### 步骤3: 更新支付工厂

在 `lib/payment/factory.ts` 中注册新的支付服务：

```typescript
import { YourPaymentService } from './providers/your-payment';

export class PaymentFactory {
  private static initializeServices() {
    // ... 现有服务
    
    // 你的支付方式
    if (this.config.your_payment?.isEnabled) {
      const yourPaymentService = new YourPaymentService(this.config.your_payment);
      this.services.set('your_payment_XX', yourPaymentService);
    }
  }
}
```

### 步骤4: 创建API端点

创建支付方式的API端点：

```typescript
// app/api/your-payment/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PaymentManager } from '@/lib/payment/manager';

export async function POST(request: NextRequest) {
  // 实现创建支付API
}

// app/api/your-payment/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PaymentManager } from '@/lib/payment/manager';

export async function POST(request: NextRequest) {
  // 实现回调处理API
}
```

### 步骤5: 更新类型定义

在 `lib/payment/types.ts` 中添加新的支付方式类型：

```typescript
export type PaymentMethod = 'jkopay' | 'stripe' | 'paypal' | 'alipay' | 'your_payment';
export type RegionCode = 'TW' | 'US' | 'EU' | 'GB' | 'JP' | 'CN' | 'HK' | 'SG' | 'AU' | 'CA' | 'XX';
export type CurrencyCode = 'TWD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'HKD' | 'SGD' | 'AUD' | 'CAD' | 'XXX';
```

## 环境变量配置

在 `.env.local` 或 `.env.production` 中添加新支付方式的环境变量：

```bash
# 你的支付方式配置
YOUR_PAYMENT_API_KEY=your_api_key
YOUR_PAYMENT_SECRET_KEY=your_secret_key
YOUR_PAYMENT_CREATE_URL=https://api.yourpayment.com/create
YOUR_PAYMENT_CALLBACK_URL=https://jinshiying.com/api/your-payment/callback
YOUR_PAYMENT_RETURN_URL=https://jinshiying.com/payment/return
```

## 测试

### 1. 单元测试

为新的支付服务创建单元测试：

```typescript
// __tests__/payment/your-payment.test.ts
import { YourPaymentService } from '@/lib/payment/providers/your-payment';

describe('YourPaymentService', () => {
  // 测试创建支付
  // 测试回调验证
  // 测试回调处理
});
```

### 2. 集成测试

测试支付流程的完整集成：

```typescript
// __tests__/integration/payment.test.ts
import { PaymentManager } from '@/lib/payment/manager';

describe('Payment Integration', () => {
  // 测试支付创建
  // 测试回调处理
  // 测试错误处理
});
```

## 最佳实践

### 1. 错误处理
- 实现完善的错误处理机制
- 记录详细的日志信息
- 提供有意义的错误消息

### 2. 安全性
- 验证所有输入参数
- 实现安全的签名验证
- 使用HTTPS进行所有通信

### 3. 性能
- 实现请求超时机制
- 使用连接池管理HTTP连接
- 缓存配置信息

### 4. 监控
- 记录支付请求和响应
- 监控支付成功率
- 设置告警机制

## 故障排除

### 常见问题

1. **签名验证失败**
   - 检查签名算法是否正确
   - 验证参数顺序是否与API文档一致
   - 确认密钥是否正确

2. **支付创建失败**
   - 检查API端点是否正确
   - 验证请求参数格式
   - 确认网络连接正常

3. **回调处理失败**
   - 检查回调URL是否可访问
   - 验证回调数据格式
   - 确认数据库连接正常

### 调试工具

使用内置的调试工具：

```bash
# 测试支付字段
node scripts/test-jkopay-fields.js

# 测试支付方式API
curl http://localhost:3001/api/payment-methods?region=TW
```

## 总结

通过遵循本指南，你可以轻松地为系统添加新的支付方式。系统采用模块化设计，新支付方式的添加不会影响现有功能，确保了系统的可扩展性和可维护性。
