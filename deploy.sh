#!/bin/bash

# 生产环境部署脚本
set -e

echo "🚀 开始部署京世盈風水系统..."

# 检查环境变量
if [ ! -f ".env.production" ]; then
    echo "❌ 请先创建 .env.production 文件"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm ci --production

# 构建应用
echo "🔨 构建应用..."
npm run build

# 启动Docker容器
echo "🐳 启动Docker容器..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 运行数据库迁移
echo "🗄️ 运行数据库迁移..."
# npm run migrate

echo "✅ 部署完成！"
echo "🌐 应用地址: https://jinshiying.com"
echo "📊 管理后台: https://jinshiying.com/admin/login"
echo "👤 用户工作台: https://jinshiying.com/dashboard"

# 显示日志
echo "📋 查看日志: docker-compose logs -f"


