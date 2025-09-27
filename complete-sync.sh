#!/bin/bash

echo "🚀 风水摆件电商系统 - 完整同步到GitHub"
echo "================================================"

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查Git状态
echo -e "${BLUE}📋 检查Git状态...${NC}"
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  初始化Git仓库...${NC}"
    git init
    echo -e "${GREEN}✅ Git仓库初始化完成${NC}"
fi

# 设置Git配置
echo -e "${BLUE}⚙️  配置Git用户信息...${NC}"
git config user.name "Fengshui Ecommerce System"
git config user.email "admin@jinshiying.com"

# 添加所有文件
echo -e "${BLUE}📝 添加所有文件到Git...${NC}"
git add .

# 检查是否有更改
if git diff --staged --quiet; then
    echo -e "${YELLOW}ℹ️  没有新的更改需要提交${NC}"
else
    # 创建提交
    echo -e "${BLUE}💾 创建提交...${NC}"
    git commit -m "feat: 生产环境完整修复和功能增强

🚀 主要修复内容:
- 修复Docker、Nginx、SSL配置问题
- 解决Node.js版本冲突和端口占用问题
- 实现完整的支付系统集成(Jkopay)
- 建立稳定的数据存储架构
- 创建系统健康检查和监控功能
- 添加CC用户102元交易数据管理
- 实现数据一致性验证系统
- 修复所有API路由和前端问题
- 完善移动端响应式设计
- 添加完整的错误处理和日志记录

🛠 技术栈:
- Next.js 14.2.16 + TypeScript
- Node.js 18 + API Routes
- Jkopay支付网关集成
- Docker + Nginx + SSL部署
- 内存数据库 + 文件持久化

🌐 部署环境:
- 生产域名: jinshiying.com
- 服务器IP: 45.77.248.70
- 状态: 生产环境稳定运行

📊 新增功能:
- 系统健康检查页面
- API状态监控
- 数据同步验证
- CC交易数据管理
- 完整的错误处理

🔧 修复问题:
- 支付系统集成问题
- 数据持久化问题
- 路由冲突问题
- 模块解析问题
- 用户界面问题
- 移动端适配问题"

    echo -e "${GREEN}✅ 提交创建成功${NC}"
    
    # 设置远程仓库（如果不存在）
    if ! git remote get-url origin > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  设置远程仓库...${NC}"
        echo -e "${BLUE}请输入GitHub仓库URL (例如: https://github.com/username/fengshui-ecommerce.git):${NC}"
        read -r repo_url
        if [ -n "$repo_url" ]; then
            git remote add origin "$repo_url"
            echo -e "${GREEN}✅ 远程仓库设置完成${NC}"
        else
            echo -e "${RED}❌ 未提供仓库URL，跳过远程设置${NC}"
        fi
    fi
    
    # 推送到远程仓库
    if git remote get-url origin > /dev/null 2>&1; then
        echo -e "${BLUE}📤 推送到GitHub仓库...${NC}"
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 成功推送到GitHub仓库！${NC}"
        else
            echo -e "${RED}❌ 推送到GitHub失败${NC}"
            echo -e "${YELLOW}💡 请检查网络连接和仓库权限${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  未设置远程仓库，跳过推送${NC}"
    fi
fi

# 显示当前状态
echo -e "${BLUE}📊 当前Git状态:${NC}"
git status --short

echo -e "${BLUE}📈 最近提交记录:${NC}"
git log --oneline -5

echo ""
echo -e "${GREEN}🎉 同步完成！${NC}"
echo "================================================"
echo -e "${BLUE}📋 项目信息:${NC}"
echo -e "  🌐 生产环境: ${GREEN}https://jinshiying.com${NC}"
echo -e "  📱 管理后台: ${GREEN}https://jinshiying.com/admin${NC}"
echo -e "  🔍 系统健康: ${GREEN}https://jinshiying.com/admin/system-health${NC}"
echo -e "  💰 支付测试: ${GREEN}https://jinshiying.com/admin/data-management${NC}"
echo ""
echo -e "${BLUE}📚 主要文档:${NC}"
echo -e "  📖 README.md - 项目说明"
echo -e "  🔧 PRODUCTION_FIXES_LOG.md - 修复记录"
echo -e "  💳 CC_TRANSACTION_SETUP.md - 交易管理"
echo ""
echo -e "${BLUE}🛠 技术栈:${NC}"
echo -e "  ⚛️  Next.js 14.2.16 + TypeScript"
echo -e "  🟢 Node.js 18 + API Routes"
echo -e "  💳 Jkopay支付网关"
echo -e "  🐳 Docker + Nginx + SSL"
echo -e "  💾 内存数据库 + 文件持久化"
echo ""
echo -e "${GREEN}✨ 系统状态: 生产环境稳定运行${NC}"

