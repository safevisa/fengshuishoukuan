import { PaymentFactoryConfig } from './types';

// 支付配置
export const paymentConfig: PaymentFactoryConfig = {
  // 街口支付配置 (台湾)
  jkopay: {
    method: 'jkopay',
    region: 'TW',
    currency: 'TWD',
    isEnabled: true,
    credentials: {
      merNo: process.env.JKOPAY_MER_NO || '1888',
      terNo: process.env.JKOPAY_TER_NO || '88816',
      secretKey: process.env.JKOPAY_SECRET_KEY || 'fe5b2c5ea084426bb1f6269acbac902f',
      merMgrURL: process.env.JKOPAY_MER_MGR_URL || 'https://jinshiying.com'
    },
    endpoints: {
      create: process.env.JKOPAY_CREATE_URL || 'https://gateway.suntone.com/payment/api/gotoPayment',
      callback: process.env.JKOPAY_CALLBACK_URL || 'https://jinshiying.com/api/jkopay/callback',
      return: process.env.JKOPAY_RETURN_URL || 'https://jinshiying.com/payment/return'
    },
    features: {
      supportsRefund: false,
      supportsPartialRefund: false,
      supportsWebhook: true,
      supports3DS: true
    }
  },

  // Stripe配置 (美国/欧洲) - 预留
  stripe: {
    method: 'stripe',
    region: 'US',
    currency: 'USD',
    isEnabled: false, // 暂时禁用
    credentials: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
    },
    endpoints: {
      create: 'https://api.stripe.com/v1/payment_intents',
      callback: 'https://jinshiying.com/api/stripe/webhook',
      return: 'https://jinshiying.com/payment/return'
    },
    features: {
      supportsRefund: true,
      supportsPartialRefund: true,
      supportsWebhook: true,
      supports3DS: true
    }
  },

  // PayPal配置 (全球) - 预留
  paypal: {
    method: 'paypal',
    region: 'US',
    currency: 'USD',
    isEnabled: false, // 暂时禁用
    credentials: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      webhookId: process.env.PAYPAL_WEBHOOK_ID || ''
    },
    endpoints: {
      create: 'https://api.paypal.com/v2/checkout/orders',
      callback: 'https://jinshiying.com/api/paypal/webhook',
      return: 'https://jinshiying.com/payment/return'
    },
    features: {
      supportsRefund: true,
      supportsPartialRefund: true,
      supportsWebhook: true,
      supports3DS: false
    }
  },

  // 支付宝配置 (中国) - 预留
  alipay: {
    method: 'alipay',
    region: 'CN',
    currency: 'CNY',
    isEnabled: false, // 暂时禁用
    credentials: {
      appId: process.env.ALIPAY_APP_ID || '',
      privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
      publicKey: process.env.ALIPAY_PUBLIC_KEY || ''
    },
    endpoints: {
      create: 'https://openapi.alipay.com/gateway.do',
      callback: 'https://jinshiying.com/api/alipay/notify',
      return: 'https://jinshiying.com/payment/return'
    },
    features: {
      supportsRefund: true,
      supportsPartialRefund: true,
      supportsWebhook: true,
      supports3DS: false
    }
  }
};

// 根据地区获取默认支付方式
export const getDefaultPaymentMethod = (region: string): string => {
  const regionMap: Record<string, string> = {
    'TW': 'jkopay',
    'US': 'stripe',
    'EU': 'stripe',
    'CN': 'alipay',
    'HK': 'stripe',
    'SG': 'stripe',
    'JP': 'stripe',
    'AU': 'stripe',
    'CA': 'stripe'
  };
  
  return regionMap[region] || 'jkopay';
};

// 根据地区获取支持的货币
export const getSupportedCurrencies = (region: string): string[] => {
  const currencyMap: Record<string, string[]> = {
    'TW': ['TWD'],
    'US': ['USD'],
    'EU': ['EUR', 'GBP'],
    'CN': ['CNY'],
    'HK': ['HKD', 'USD'],
    'SG': ['SGD', 'USD'],
    'JP': ['JPY'],
    'AU': ['AUD'],
    'CA': ['CAD', 'USD']
  };
  
  return currencyMap[region] || ['USD'];
};
