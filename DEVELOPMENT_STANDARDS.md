# 风水摆件电商系统 - 开发规范

## 🎯 概述

本项目严格遵循 **Cursor 6S 开发规范**，确保代码质量、可维护性和团队协作效率。

## 📋 6S 规范详解

### 1. Sort（整理）- 消除冗余
- ✅ **已清理内容**：
  - 删除了模拟数据库文件
  - 移除了测试页面和调试API
  - 清理了不必要的依赖
  - 统一了数据库字段命名

- 🔧 **执行命令**：
  ```bash
  npm run 6s-sort
  ```

### 2. Set in Order（整顿）- 物有所位
- ✅ **项目结构**：
  ```
  fengshui-ecommerce/
  ├── app/                    # Next.js App Router
  │   ├── admin/             # 管理后台
  │   ├── api/               # API路由
  │   ├── auth/              # 认证页面
  │   ├── dashboard/         # 用户工作台
  │   └── pay/               # 支付页面
  ├── components/            # 通用组件
  ├── lib/                   # 工具库
  ├── docs/                  # 文档
  └── scripts/               # 脚本工具
  ```

- 📏 **命名规范**：
  - 变量/函数：`camelCase`
  - 组件/类：`PascalCase`
  - 数据库字段：`snake_case`
  - 常量：`UPPER_SNAKE_CASE`

### 3. Shine（清扫）- 清洁环境
- ✅ **代码质量**：
  - 修复了17个TypeScript linter错误
  - 统一了类型定义和接口
  - 清理了所有未使用的导入
  - 确保了类型安全性

- 🔧 **执行命令**：
  ```bash
  npm run 6s-shine
  ```

### 4. Standardize（标准化）- 统一规范
- 📝 **Git提交规范**：
  ```
  feat: 添加新功能
  fix: 修复bug
  refactor: 重构代码
  docs: 更新文档
  style: 代码格式调整
  test: 添加测试
  chore: 构建过程或辅助工具的变动
  ```

- 🔄 **提交流程**：
  ```bash
  lint → build → test → review → merge
  ```

### 5. Sustain（维持）- 持续改进
- 📊 **技术债管理**：
  - 定期清理无用代码
  - 保持类型定义完整
  - 维护文档更新
  - 优化AI提示词

### 6. Security（安全）- 安全第一
- 🔒 **安全措施**：
  - 环境变量管理（`.env`文件）
  - API签名验证
  - 用户权限控制
  - 数据库连接安全

- 🔧 **安全检查**：
  ```bash
  npm run 6s-security
  ```

## 🚀 快速开始

### 安装依赖
```bash
pnpm install
```

### 开发环境
```bash
pnpm dev
```

### 代码检查
```bash
# 完整6S检查
npm run 6s-check

# 单独检查
npm run 6s-sort    # 整理检查
npm run 6s-shine   # 清扫检查
npm run 6s-security # 安全检查
```

### 构建项目
```bash
pnpm build
```

## 📋 开发检查清单

### 提交前检查
- [ ] 代码通过ESLint检查
- [ ] TypeScript类型检查通过
- [ ] 所有测试用例通过
- [ ] 代码格式化完成
- [ ] 无console.log残留
- [ ] 敏感信息已移除
- [ ] 提交信息符合规范

### 代码审查要点
- [ ] 类型安全性
- [ ] 错误处理完整性
- [ ] 性能优化
- [ ] 安全性检查
- [ ] 代码可读性
- [ ] 文档完整性

## 🔧 工具配置

### ESLint 配置
```json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
```

### Prettier 配置
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## 📚 相关文档

- [Cursor 6S 开发规范](./docs/6s-dev-standard.md)
- [API 文档](./API_DOCUMENTATION.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)
- [数据库修复指南](./DATABASE_FIX_SUMMARY.md)

## 🤝 团队协作

### Cursor 使用守则
1. **理解而非复制**：不依赖AI直接copy代码，必须理解逻辑
2. **精准提示词**：使用规范化的AI提示词
3. **团队共享**：建立"Cursor 宏/Prompt 模板"

### 代码审查流程
1. 开发者提交PR
2. 自动运行6S检查
3. 人工代码审查
4. 通过后合并

## 📞 支持

如有问题，请参考：
- 项目文档
- 团队规范
- 代码审查意见

---

**最后更新**：2025-09-28  
**版本**：v1.0  
**维护者**：开发团队
