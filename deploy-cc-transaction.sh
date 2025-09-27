#!/bin/bash

echo "🚀 部署CC交易功能..."

# 切换到项目目录
cd /opt/fengshui-ecommerce/fengshui-ecommerce

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 重新构建应用
echo "🔨 重新构建应用..."
pnpm run build

# 重启应用服务
echo "🔄 重启应用服务..."
systemctl restart fengshui-app

# 等待服务启动
sleep 5

# 检查服务状态
echo "📊 检查服务状态..."
systemctl status fengshui-app --no-pager -l

echo "✅ CC交易功能部署完成！"
echo "📱 访问数据管理页面: https://jinshiying.com/admin/data-management"
echo "💡 点击'添加CC交易'按钮来添加用户cc的102元交易数据"

