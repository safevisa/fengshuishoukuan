#!/bin/bash

# 一键部署脚本 - 新服务器
# 使用方法: ./one-click-deploy.sh

set -e

echo "🚀 开始一键部署风水摆件电商系统..."

# 1. 更新系统
echo "📦 更新系统..."
apt update && apt upgrade -y

# 2. 安装必要工具
echo "🔧 安装必要工具..."
apt install -y curl wget git unzip nginx ufw

# 3. 安装Docker
echo "🐳 安装Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
fi

# 4. 安装Docker Compose
echo "🐙 安装Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 5. 配置防火墙
echo "🔥 配置防火墙..."
ufw --force enable
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000

# 6. 克隆代码
echo "📥 克隆代码..."
cd /root
rm -rf baijian
git clone https://github.com/safevisa/baijian.git
cd baijian

# 7. 设置权限
echo "⚙️ 设置权限..."
chmod +x *.sh

# 8. 执行部署
echo "🚀 执行部署..."
./complete-deploy.sh jinshiying.com

echo "✅ 部署完成！"
echo "🌐 网站地址: https://jinshiying.com"
echo "🔧 管理命令:"
echo "  查看Docker状态: docker ps"
echo "  查看Nginx状态: systemctl status nginx"
echo "  重启服务: docker-compose -f docker-compose.prod-fixed.yml restart"


