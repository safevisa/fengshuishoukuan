# 京世盈風水 API 文档

## 概述

这是一个轻量化、安全稳定的生产级支付系统，支持多种支付方式，提供完整的收款链接生成和管理功能。

## 基础信息

- **Base URL**: `https://jinshiying.com/api/v1`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证

所有API请求都需要在Header中携带JWT令牌：

```
Authorization: Bearer <your-jwt-token>
```

## API 端点

### 1. 收款链接管理

#### 创建收款链接
```http
POST /api/v1/payment-links
```

**请求体:**
```json
{
  "title": "商品收款",
  "description": "购买风水摆件",
  "amount": 100.00,
  "currency": "TWD",
  "paymentMethodId": "jkopay",
  "expiresAt": "2024-12-31T23:59:59Z",
  "maxUses": 100
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "link_1234567890_abc123",
    "title": "商品收款",
    "amount": 100.00,
    "currency": "TWD",
    "paymentUrl": "https://jinshiying.com/pay/link_1234567890_abc123",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=...",
    "expiresAt": "2024-12-31T23:59:59Z",
    "maxUses": 100,
    "usedCount": 0
  }
}
```

#### 获取收款链接列表
```http
GET /api/v1/payment-links?page=1&limit=10
```

**响应:**
```json
{
  "success": true,
  "data": {
    "paymentLinks": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

### 2. 支付处理

#### 创建支付
```http
POST /api/v1/payments
```

**请求体:**
```json
{
  "paymentLinkId": "link_1234567890_abc123",
  "amount": 100.00,
  "currency": "TWD",
  "paymentMethodId": "jkopay"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://api.jkopay.com/pay/...",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "transactionId": "txn_1234567890"
  }
}
```

#### 验证支付状态
```http
GET /api/v1/payments?transactionId=txn_1234567890&paymentMethodId=jkopay
```

**响应:**
```json
{
  "success": true,
  "data": {
    "status": "success",
    "amount": 100.00,
    "currency": "TWD"
  }
}
```

### 3. 用户管理

#### 用户注册
```http
POST /api/v1/auth/register
```

**请求体:**
```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "+886912345678",
  "password": "password123"
}
```

#### 用户登录
```http
POST /api/v1/auth/login
```

**请求体:**
```json
{
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "name": "张三",
      "email": "zhangsan@example.com",
      "role": "user"
    }
  }
}
```

## 支付方式

### 街口支付 (JKOPAY)
- **支付方式ID**: `jkopay`
- **支持货币**: TWD
- **手续费率**: 1.5%
- **最小金额**: 1 TWD
- **最大金额**: 100,000 TWD

### 支付宝 (Alipay)
- **支付方式ID**: `alipay`
- **支持货币**: CNY
- **手续费率**: 0.6%
- **最小金额**: 0.01 CNY

### 微信支付 (WeChat Pay)
- **支付方式ID**: `wechat`
- **支持货币**: CNY
- **手续费率**: 0.6%
- **最小金额**: 0.01 CNY

## 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 安全特性

1. **JWT认证**: 所有API都需要有效的JWT令牌
2. **HTTPS**: 强制使用HTTPS加密传输
3. **CORS**: 配置跨域资源共享
4. **Rate Limiting**: 防止API滥用
5. **输入验证**: 严格的参数验证
6. **SQL注入防护**: 使用参数化查询
7. **XSS防护**: 输出转义

## 部署说明

### 使用Docker部署

1. 复制环境变量文件：
```bash
cp env.production .env.production
```

2. 编辑环境变量：
```bash
nano .env.production
```

3. 运行部署脚本：
```bash
./deploy.sh
```

### 手动部署

1. 安装依赖：
```bash
npm ci --production
```

2. 构建应用：
```bash
npm run build
```

3. 启动服务：
```bash
npm start
```

## 监控和日志

- **应用监控**: 集成Sentry错误监控
- **性能监控**: 内置性能指标收集
- **访问日志**: Nginx访问日志
- **应用日志**: 结构化JSON日志

## 支持

如有问题，请联系：
- 技术支持: tech@jinshiying.com
- 客服电话: +852 61588111

