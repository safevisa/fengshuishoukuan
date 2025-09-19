# 街口支付集成说明

## 概述
本项目已集成台湾街口支付（JKOPAY），支持创建支付、验证支付和退款功能。

## 配置步骤

### 1. 获取街口支付商户信息
1. 访问 [街口支付官网](https://www.jkopay.com/)
2. 注册商户账号
3. 完成商户认证
4. 获取以下信息：
   - 商户ID (Merchant ID)
   - API密钥 (API Key)
   - 密钥 (Secret Key)

### 2. 配置环境变量
在项目根目录创建 `.env.local` 文件，添加以下配置：

```env
# 街口支付配置
JKOPAY_MERCHANT_ID=your_merchant_id
JKOPAY_API_KEY=your_api_key
JKOPAY_SECRET_KEY=your_secret_key
JKOPAY_API_URL=https://api.jkopay.com
JKOPAY_RETURN_URL=https://yourdomain.com/payment/return
JKOPAY_NOTIFY_URL=https://yourdomain.com/api/payment/notify
```

### 3. 设置回调URL
在街口支付商户后台设置：
- **返回URL**: `https://yourdomain.com/payment/return`
- **通知URL**: `https://yourdomain.com/api/payment/notify`

## API 接口

### 创建支付
```typescript
POST /api/payment/create
{
  "orderId": "order-123",
  "paymentMethodId": "jkopay-001"
}
```

### 验证支付
```typescript
POST /api/payment/verify
{
  "paymentId": "payment-123"
}
```

### 退款
```typescript
POST /api/payment/refund
{
  "paymentId": "payment-123",
  "amount": 100.00
}
```

## 支付流程

1. **用户选择街口支付**
2. **系统调用街口支付API创建支付**
3. **用户跳转到街口支付页面完成支付**
4. **街口支付回调通知支付结果**
5. **系统更新订单状态**

## 费用说明

- 街口支付手续费率：1.5%
- 平台服务费：5%
- 提现手续费：固定 $2

## 安全注意事项

1. **签名验证**：所有API调用都需要验证签名
2. **HTTPS**：确保所有回调URL使用HTTPS
3. **IP白名单**：在街口支付后台设置IP白名单
4. **密钥管理**：妥善保管API密钥，不要提交到代码仓库

## 测试环境

街口支付提供测试环境，可以使用测试商户信息进行开发测试。

## 支持的功能

- ✅ 创建支付链接
- ✅ 支付状态查询
- ✅ 支付结果通知
- ✅ 退款处理
- ✅ 财务报表
- ✅ 订单管理

## 联系方式

如有问题，请联系：
- 街口支付客服：0800-123-456
- 技术支持：tech@jkopay.com
