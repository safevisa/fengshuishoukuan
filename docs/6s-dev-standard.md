# Cursor 6S 开发规范

## 1. Sort（整理）
- **代码层面**  
  - 删除无用代码、废弃接口、注释掉的冗余逻辑。  
  - 移除无用依赖，保持 `package.json`、`pnpm-lock.yaml` 干净。  
- **AI 辅助**  
  - 使用 Cursor 的 "Explain" 功能检查可删除的 legacy 代码。  
  - 通过 Cursor Agent 自动检测未使用的函数、import。  

---

## 2. Set in Order（整顿）
- **代码结构**  
  - 遵循 `feature-based` 或 `domain-driven` 文件夹结构，避免随意堆积。  
  - 统一模块命名：`camelCase`（变量函数）、`PascalCase`（类/组件）、`snake_case`（数据库字段）。  
- **AI 辅助**  
  - 用 Cursor 自动生成 README，说明各目录职责。  
  - 通过 "Refactor" 功能整理 imports 与导出。  

---

## 3. Shine（清扫）
- **开发环境**  
  - 保持 ESLint、Prettier 规则始终生效，避免脏代码。  
  - 提交前必须通过 `lint & test`。  
- **AI 辅助**  
  - 使用 Cursor 的 `@fix` 命令快速修复 lint 错误。  
  - 使用 AI 自动生成单元测试，覆盖关键逻辑。  

---

## 4. Standardize（标准化）
- **代码风格**  
  - 使用统一的 ESLint + Prettier 配置，全员一致。  
  - Git commit 遵循 **Conventional Commits**（feat、fix、refactor…）。  
- **流程**  
  - PR 前必须：`lint → build → test → review → merge`。  
- **AI 辅助**  
  - 通过 Cursor 的 Code Review 代理，生成自动审查意见。  
  - 使用 AI 自动补齐注释（函数、接口、API 文档）。  

---

## 5. Sustain（维持）
- **持续改进**  
  - 每周进行一次 Cursor 提示词（Prompt）优化复盘，减少无效对话。  
  - 技术债必须在每个 Sprint 内至少还掉一部分。  
- **AI 辅助**  
  - 建立"Cursor 宏/Prompt 模板"，沉淀高效的提示语。  
  - 自动生成 changelog，保持文档更新。  

---

## 6. Security（安全）
- **代码安全**  
  - 不在代码里存放明文密钥，使用 `.env` + Vault。  
  - 所有 API 调用必须加签名/鉴权。  
- **AI 辅助**  
  - 通过 Cursor 自动扫描代码中的敏感信息（key、token）。  
  - 利用 AI 辅助编写安全测试用例。  

---

# 📌 执行方式
1. **落地文档**：放在 `/docs/6s-dev-standard.md`。  
2. **CI/CD 集成**：在 GitHub Actions / GitLab CI 中强制检查。  
3. **Cursor 使用守则**：  
   - 不依赖 AI 直接 copy 代码，必须理解逻辑。  
   - AI 提示词要规范化，团队共用一套最佳实践。  

---

# 🎯 项目特定规范

## 风水摆件电商系统开发规范

### 1. Sort（整理）- 项目清理
- **已清理内容**：
  - ✅ 删除了模拟数据库文件（`lib/database.ts`, `lib/storage.ts` 等）
  - ✅ 移除了测试页面和调试API
  - ✅ 清理了不必要的依赖和文件
  - ✅ 统一了数据库字段命名（snake_case）

### 2. Set in Order（整顿）- 项目结构
- **目录结构**：
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
  │   ├── mysql-database.ts  # 数据库操作
  │   └── types.ts           # 类型定义
  └── docs/                  # 文档
  ```

### 3. Shine（清扫）- 代码质量
- **已修复问题**：
  - ✅ 修复了17个TypeScript linter错误
  - ✅ 统一了类型定义和接口
  - ✅ 清理了所有未使用的导入
  - ✅ 确保了类型安全性

### 4. Standardize（标准化）- 代码规范
- **命名约定**：
  - 变量/函数：`camelCase`
  - 组件/类：`PascalCase`
  - 数据库字段：`snake_case`
  - 常量：`UPPER_SNAKE_CASE`

- **Git提交规范**：
  ```
  feat: 添加新功能
  fix: 修复bug
  refactor: 重构代码
  docs: 更新文档
  style: 代码格式调整
  test: 添加测试
  chore: 构建过程或辅助工具的变动
  ```

### 5. Sustain（维持）- 持续改进
- **技术债管理**：
  - 定期清理无用代码
  - 保持类型定义完整
  - 维护文档更新
  - 优化AI提示词

### 6. Security（安全）- 安全规范
- **已实施安全措施**：
  - ✅ 环境变量管理（`.env`文件）
  - ✅ API签名验证
  - ✅ 用户权限控制
  - ✅ 数据库连接安全

---

# 🔧 开发工具配置

## ESLint 配置
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

## Prettier 配置
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Git Hooks
```bash
# pre-commit
npm run lint
npm run type-check

# pre-push
npm run build
npm run test
```

---

# 📋 检查清单

## 提交前检查
- [ ] 代码通过ESLint检查
- [ ] TypeScript类型检查通过
- [ ] 所有测试用例通过
- [ ] 代码格式化完成
- [ ] 无console.log残留
- [ ] 敏感信息已移除

## 代码审查要点
- [ ] 类型安全性
- [ ] 错误处理完整性
- [ ] 性能优化
- [ ] 安全性检查
- [ ] 代码可读性
- [ ] 文档完整性

---

# 🚀 快速开始

1. **安装依赖**：`pnpm install`
2. **启动开发**：`pnpm dev`
3. **代码检查**：`pnpm lint`
4. **类型检查**：`pnpm type-check`
5. **构建项目**：`pnpm build`

---

**最后更新**：2025-09-28  
**版本**：v1.0  
**维护者**：开发团队
