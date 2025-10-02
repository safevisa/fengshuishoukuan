# 京世盈风水收款系统

一个基于 Next.js 14 的现代化收款链接管理系统，支持多种支付方式，专为风水商品销售设计。

## 🚀 功能特性

### 核心功能
- **收款链接管理**: 创建、管理和分享收款链接
- **多种支付方式**: 支持街口支付，可扩展其他支付方式
- **用户管理**: 管理员和商户用户权限管理
- **订单管理**: 完整的订单生命周期管理
- **财务报告**: 详细的财务统计和对账报告
- **提现管理**: 用户提现申请和处理

### 技术特性
- **现代化架构**: Next.js 14 + TypeScript + Tailwind CSS
- **响应式设计**: 完美适配桌面和移动设备
- **支付抽象层**: 易于扩展新的支付方式
- **数据库优化**: MySQL 连接池和性能优化
- **安全认证**: JWT 令牌和权限控制
- **实时更新**: 自动刷新和手动刷新功能

## 📁 项目结构

```
fengshui-ecommerce/
├── app/                          # Next.js 应用目录
│   ├── admin/                    # 管理员后台
│   ├── api/                      # API 路由
│   ├── auth/                     # 认证页面
│   ├── dashboard/                # 用户工作台
│   └── pay/                      # 支付页面
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 组件库
│   ├── admin-guard.tsx          # 管理员权限守卫
│   └── user-guard.tsx           # 用户权限守卫
├── lib/                         # 工具库
│   ├── payment/                 # 支付抽象层
│   ├── auth.ts                  # 认证工具
│   ├── database.ts              # 数据库连接
│   ├── mysql-database.ts        # MySQL 操作
│   └── types.ts                 # TypeScript 类型定义
├── scripts/                     # 脚本文件
│   ├── create-admin.js          # 创建管理员脚本
│   ├── test-database.js         # 数据库测试
│   └── update-database-schema.sql # 数据库更新
└── docs/                        # 文档
    ├── 6s-dev-standard.md       # 开发规范
    └── PAYMENT_EXTENSION_GUIDE.md # 支付扩展指南
```

## 🛠️ 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS, shadcn/ui
- **数据库**: MySQL 8.0
- **支付**: 街口支付 (JkoPay)
- **认证**: JWT
- **部署**: Docker, PM2

## 🚀 快速开始

### 环境要求
- Node.js 18+
- MySQL 8.0+
- pnpm (推荐) 或 npm

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/safevisa/fengshuishoukuan.git
cd fengshuishoukuan
```

2. **安装依赖**
```bash
pnpm install
# 或
npm install
```

3. **配置环境变量**
```bash
cp env.example .env.local
```

编辑 `.env.local` 文件，配置数据库和支付参数：
```env
# MySQL 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=fengshui_user
MYSQL_PASSWORD=fengshui_password
MYSQL_DATABASE=fengshui_ecommerce

# 街口支付配置
JKOPAY_MERCHANT_ID=1888
JKOPAY_TERMINAL_ID=888506
JKOPAY_SECRET_KEY=your_secret_key
JKOPAY_RETURN_URL=http://localhost:3000/payment/return
JKOPAY_NOTIFY_URL=http://localhost:3000/api/jkopay/callback

# 应用配置
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. **初始化数据库**
```bash
# 创建数据库和表
mysql -u root -p < init-database.sql

# 或使用脚本
node scripts/create-admin.js
```

5. **启动开发服务器**
```bash
pnpm dev
# 或
npm run dev
```

访问 http://localhost:3000 查看应用。

## 📖 使用指南

### 管理员后台
- 访问 `/admin` 进入管理员后台
- 默认管理员账号: `admin@jinshiying.com` / `admin123`
- 功能包括: 用户管理、订单管理、财务报告、数据导出

### 用户工作台
- 访问 `/dashboard` 进入用户工作台
- 商户用户可以创建收款链接、查看订单、申请提现
- 支持图片上传、一次性链接、使用次数限制

### 支付流程
1. 商户创建收款链接
2. 客户访问支付页面 `/pay/[linkId]`
3. 自动跳转到街口支付
4. 支付完成后回调更新订单状态

## 🔧 开发指南

### 代码规范
项目遵循 6S 开发标准，详见 `docs/6s-dev-standard.md`：
- **整理 (Sort)**: 消除冗余代码
- **整顿 (Set in Order)**: 统一项目结构
- **清扫 (Shine)**: 保持代码清洁
- **标准化 (Standardize)**: 统一编码规范
- **维持 (Sustain)**: 持续改进
- **安全 (Security)**: 安全第一

### 支付方式扩展
项目采用支付抽象层设计，易于扩展新的支付方式。详见 `docs/PAYMENT_EXTENSION_GUIDE.md`。

### 数据库管理
- 使用 MySQL 8.0
- 支持连接池和自动重连
- 提供数据库更新脚本

## 🚀 部署

### Docker 部署
```bash
# 构建镜像
docker build -t fengshui-ecommerce .

# 运行容器
docker run -p 3000:3000 fengshui-ecommerce
```

### 生产环境部署
1. 配置生产环境变量
2. 构建应用: `npm run build`
3. 使用 PM2 启动: `pm2 start npm --name "fengshui" -- start`

## 📊 监控和维护

### 日志监控
- 所有 API 都有详细的日志记录
- 支付回调有完整的错误处理
- 数据库操作有性能监控

### 数据备份
- 定期备份 MySQL 数据库
- 导出功能支持 CSV 格式
- 提供数据恢复脚本

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -m 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 提交 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 📞 支持

如有问题或建议，请通过以下方式联系：
- 创建 Issue
- 发送邮件至: support@jinshiying.com
- 访问官网: https://jinshiying.com

---

**京世盈风水收款系统** - 让收款更简单，让管理更高效！