// 生产环境配置管理
export const config = {
  // 应用配置
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || '京世盈風水',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://jinshiying.com',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },

  // 数据库配置
  database: {
    url: process.env.DATABASE_URL || 'sqlite:./data/app.db',
    type: process.env.DB_TYPE || 'sqlite', // sqlite, postgresql, mysql
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // 支付配置
  payment: {
    // 街口支付
    jkopay: {
      merchantId: process.env.JKOPAY_MERCHANT_ID,
      apiKey: process.env.JKOPAY_API_KEY,
      secretKey: process.env.JKOPAY_SECRET_KEY,
      apiUrl: process.env.JWOPAY_API_URL || 'https://api.jkopay.com',
      returnUrl: process.env.JKOPAY_RETURN_URL || 'https://jinshiying.com/payment/return',
      notifyUrl: process.env.JKOPAY_NOTIFY_URL || 'https://jinshiying.com/api/payment/notify',
      feeRate: 0.015, // 1.5%
    },
    
    // 支付宝
    alipay: {
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY,
      publicKey: process.env.ALIPAY_PUBLIC_KEY,
      feeRate: 0.006, // 0.6%
    },

    // 微信支付
    wechat: {
      appId: process.env.WECHAT_APP_ID,
      mchId: process.env.WECHAT_MCH_ID,
      apiKey: process.env.WECHAT_API_KEY,
      feeRate: 0.006, // 0.6%
    },
  },

  // 安全配置
  security: {
    bcryptRounds: 12,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100, // 限制每个IP 15分钟内最多100个请求
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'https://jinshiying.com',
      credentials: true,
    },
  },

  // 文件上传配置
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadDir: './uploads',
  },

  // 邮件配置
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },

  // Redis配置（用于缓存和会话）
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // 监控配置
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: process.env.LOG_LEVEL || 'info',
  },
}

// 验证必需的环境变量
export function validateConfig() {
  const required = [
    'JWT_SECRET',
    'DATABASE_URL',
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  return true
}


