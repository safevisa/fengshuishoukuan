#!/bin/bash

# Cursor 6S 开发规范检查脚本
# 用于在提交前自动检查代码质量

echo "🔍 开始执行 Cursor 6S 开发规范检查..."

# 1. Sort（整理）- 检查无用代码
echo "📋 1. Sort（整理）检查..."
echo "  - 检查未使用的导入..."
npx eslint . --ext .ts,.tsx --rule '@typescript-eslint/no-unused-vars: error' --quiet

echo "  - 检查未使用的依赖..."
npx depcheck --skip-missing

# 2. Set in Order（整顿）- 检查代码结构
echo "📁 2. Set in Order（整顿）检查..."
echo "  - 检查文件命名规范..."
find . -name "*.ts" -o -name "*.tsx" | grep -E '[A-Z]' | head -5

echo "  - 检查导入顺序..."
npx eslint . --ext .ts,.tsx --rule 'import/order: error' --quiet

# 3. Shine（清扫）- 代码质量检查
echo "✨ 3. Shine（清扫）检查..."
echo "  - ESLint 检查..."
npx eslint . --ext .ts,.tsx --max-warnings 0

echo "  - TypeScript 类型检查..."
npx tsc --noEmit

echo "  - Prettier 格式化检查..."
npx prettier --check .

# 4. Standardize（标准化）- 代码规范检查
echo "📏 4. Standardize（标准化）检查..."
echo "  - 检查提交信息格式..."
if [ -n "$1" ]; then
    if [[ ! "$1" =~ ^(feat|fix|refactor|docs|style|test|chore)(\(.+\))?: .+ ]]; then
        echo "❌ 提交信息格式不符合 Conventional Commits 规范"
        echo "   正确格式: type(scope): description"
        echo "   类型: feat, fix, refactor, docs, style, test, chore"
        exit 1
    else
        echo "✅ 提交信息格式正确"
    fi
fi

# 5. Sustain（维持）- 持续改进检查
echo "🔄 5. Sustain（维持）检查..."
echo "  - 检查TODO注释..."
grep -r "TODO\|FIXME\|HACK" --include="*.ts" --include="*.tsx" . | head -5

echo "  - 检查技术债..."
grep -r "TECHNICAL_DEBT\|DEPRECATED" --include="*.ts" --include="*.tsx" . | head -5

# 6. Security（安全）- 安全检查
echo "🔒 6. Security（安全）检查..."
echo "  - 检查敏感信息..."
grep -r "password\|secret\|key\|token" --include="*.ts" --include="*.tsx" . | grep -v "//" | head -5

echo "  - 检查环境变量使用..."
grep -r "process\.env" --include="*.ts" --include="*.tsx" . | head -5

# 构建检查
echo "🏗️ 构建检查..."
echo "  - 执行构建..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 所有检查通过！代码符合 Cursor 6S 开发规范"
    exit 0
else
    echo "❌ 检查失败，请修复问题后重试"
    exit 1
fi
