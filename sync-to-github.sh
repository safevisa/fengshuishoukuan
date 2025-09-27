#!/bin/bash

echo "🚀 开始同步所有生产环境修复到GitHub仓库..."

# 检查是否在Git仓库中
if [ ! -d ".git" ]; then
    echo "❌ 当前目录不是Git仓库，正在初始化..."
    git init
    git remote add origin https://github.com/your-username/fengshui-ecommerce.git
fi

# 添加所有修改的文件
echo "📝 添加所有修改的文件..."
git add .

# 检查是否有未提交的更改
if git diff --staged --quiet; then
    echo "ℹ️ 没有新的更改需要提交"
else
    # 提交更改
    echo "💾 提交更改..."
    git commit -m "feat: 生产环境完整修复和功能增强

- 修复Docker、Nginx、SSL配置问题
- 解决Node.js版本冲突和端口占用
- 实现完整的支付系统集成(Jkopay)
- 建立稳定的数据存储架构
- 创建系统健康检查和监控
- 添加CC用户102元交易数据管理
- 实现数据一致性验证
- 修复所有API路由和前端问题
- 完善移动端响应式设计
- 添加完整的错误处理和日志记录

技术栈: Next.js 14.2.16, Node.js 18, Nginx, Docker, SSL
部署环境: jinshiying.com (45.77.248.70)
状态: 生产环境稳定运行"

    # 推送到GitHub
    echo "📤 推送到GitHub仓库..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ 成功同步到GitHub仓库！"
        echo "🔗 仓库地址: https://github.com/your-username/fengshui-ecommerce"
    else
        echo "❌ 推送到GitHub失败，请检查网络连接和权限"
        exit 1
    fi
fi

echo "📊 显示当前状态..."
git status
git log --oneline -5

echo "🎉 同步完成！"
echo ""
echo "📋 主要修复内容:"
echo "  ✅ Docker和Nginx配置问题"
echo "  ✅ SSL证书配置"
echo "  ✅ Node.js版本和端口问题"
echo "  ✅ 支付系统集成(Jkopay)"
echo "  ✅ 数据存储和持久化"
echo "  ✅ API路由和前端问题"
echo "  ✅ 用户界面和移动端适配"
echo "  ✅ 系统监控和健康检查"
echo "  ✅ CC用户交易数据管理"
echo "  ✅ 数据一致性验证"
echo ""
echo "🌐 生产环境: https://jinshiying.com"
echo "📱 管理后台: https://jinshiying.com/admin"
echo "🔍 系统健康: https://jinshiying.com/admin/system-health"

