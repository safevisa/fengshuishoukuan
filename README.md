# 风水摆件电商系统

## 项目简介

一个完整的电商系统，专门用于风水摆件销售，集成了支付系统、用户管理、订单处理等功能。

## 🌟 主要功能

- **用户管理**: 用户注册、登录、个人资料管理
- **商品管理**: 风水摆件商品展示和管理
- **支付系统**: 集成Jkopay支付网关
- **订单管理**: 完整的订单流程处理
- **收款链接**: 灵活的收款链接生成和管理
- **数据统计**: 财务报表和对账功能
- **系统监控**: 健康检查和数据同步验证

## 🛠 技术栈

- **前端**: Next.js 14.2.16, TypeScript, Tailwind CSS
- **后端**: Node.js 18, Next.js API Routes
- **数据库**: 内存存储 + 文件系统持久化
- **支付**: Jkopay API集成
- **部署**: Docker, Nginx, SSL
- **服务器**: Ubuntu 22.04.5 LTS

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm
- Docker (可选)
- Nginx (生产环境)

### 安装依赖

```bash
pnpm install
```

### 开发环境

```bash
pnpm run dev
```

### 生产环境构建

```bash
pnpm run build
pnpm start
```

## 🌐 部署信息

- **生产环境**: https://jinshiying.com
- **服务器IP**: 45.77.248.70
- **管理后台**: https://jinshiying.com/admin
- **系统健康**: https://jinshiying.com/admin/system-health

## 📁 项目结构

```
fengshui-ecommerce/
├── app/                          # Next.js App Router
│   ├── admin/                    # 管理后台页面
│   │   ├── system-health/        # 系统健康检查
│   │   ├── data-management/      # 数据管理
│   │   └── ...
│   ├── api/                      # API路由
│   │   ├── admin/                # 管理API
│   │   ├── jkopay/               # 支付API
│   │   ├── payment/              # 支付处理
│   │   └── ...
│   ├── auth/                     # 认证页面
│   ├── dashboard/                # 用户仪表板
│   └── pay/                      # 支付页面
├── lib/                          # 工具库
│   ├── production-database.ts    # 生产数据库
│   └── types.ts                  # 类型定义
├── components/                   # 可复用组件
├── public/                       # 静态资源
└── docs/                         # 文档
```

## 🔧 配置

### 环境变量

```bash
# Jkopay支付配置
JKOPAY_MERCHANT_ID=1888
JKOPAY_TERMINAL_ID=888506
JKOPAY_SECRET_KEY=your-secret-key
JKOPAY_API_URL=https://gateway.suntone.com/payment/api/gotoPayment

# Next.js配置
NODE_ENV=production
NEXTAUTH_URL=https://jinshiying.com
NEXTAUTH_SECRET=your-secret-key
```

### 支付配置

系统集成了Jkopay支付网关，支持：
- 支付链接生成
- 支付回调处理
- 交易状态查询
- 数据同步验证

## 📊 主要API

### 用户管理
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/users` - 获取用户列表

### 支付系统
- `POST /api/payment-links` - 创建收款链接
- `GET /api/payment-links/[linkId]` - 获取链接详情
- `POST /api/jkopay/create-payment` - 创建支付
- `POST /api/payment/notify` - 支付回调

### 数据管理
- `GET /api/payment-stats` - 支付统计
- `GET /api/financial-report` - 财务报表
- `GET /api/reconciliation` - 对账报告

### 系统监控
- `GET /api/admin/check-data-apis` - API状态检查
- `GET /api/admin/check-data-sync` - 数据同步检查
- `POST /api/admin/add-cc-transaction` - 添加测试交易

## 🔍 系统监控

### 健康检查

访问 `/admin/system-health` 可以查看：
- API状态检查
- 数据同步状态
- 系统性能指标
- 错误日志和警告

### 数据一致性

系统自动检查：
- 用户-订单关联
- 订单-支付关联
- 收款链接-订单关联
- 金额一致性
- 状态一致性

## 📝 开发指南

### 添加新功能

1. 在 `app/` 目录下创建相应的页面或API路由
2. 更新 `lib/types.ts` 添加必要的类型定义
3. 在 `lib/production-database.ts` 中添加数据操作方法
4. 更新相关的前端组件

### 数据库操作

系统使用内存数据库，主要操作在 `lib/production-database.ts` 中：

```typescript
// 添加用户
const user = await productionDB.addUser(userData);

// 获取所有订单
const orders = await productionDB.getAllOrders();

// 更新支付状态
await productionDB.updatePayment(paymentId, { status: 'completed' });
```

### 支付集成

支付相关功能在 `app/api/jkopay/` 目录下：

- `create-payment/route.ts` - 创建支付订单
- `query-transaction/route.ts` - 查询交易状态
- `verify-transaction/route.ts` - 验证交易

## 🚨 故障排除

### 常见问题

1. **502 Bad Gateway**
   - 检查Node.js应用是否运行
   - 重启Nginx服务

2. **支付失败**
   - 检查Jkopay配置
   - 验证签名生成

3. **数据不同步**
   - 使用系统健康检查页面
   - 检查API状态

### 日志查看

```bash
# 应用日志
journalctl -u fengshui-app -f

# Nginx日志
tail -f /var/log/nginx/error.log
```

## 📚 文档

- [生产环境修复记录](PRODUCTION_FIXES_LOG.md)
- [CC交易数据管理](CC_TRANSACTION_SETUP.md)
- [部署脚本](deploy-cc-transaction.sh)

## 🤝 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 支持

如有问题，请通过以下方式联系：
- 邮箱: admin@jinshiying.com
- 网站: https://jinshiying.com

---

**最后更新**: 2025-09-24  
**版本**: v1.0.0  
**状态**: 生产环境稳定运行