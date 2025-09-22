#!/bin/bash

# 风水摆件电商网站 - 快速部署脚本
# 服务器: 45.77.248.70 (新加坡)
# 配置: 1 vCPU, 4GB RAM, 30GB NVMe

set -e

echo "🚀 开始快速部署风水摆件电商网站..."

# 1. 更新系统
echo "📦 更新系统..."
apt update && apt upgrade -y

# 2. 安装必要工具
echo "🔧 安装必要工具..."
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# 3. 安装Node.js 18
echo "📦 安装Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 4. 安装pnpm
echo "📦 安装pnpm..."
npm install -g pnpm

# 5. 创建应用目录
echo "📁 创建应用目录..."
mkdir -p /opt/fengshui-ecommerce
cd /opt/fengshui-ecommerce

# 6. 克隆代码
echo "📥 克隆代码..."
git clone https://github.com/safevisa/baijian.git fengshui-ecommerce
cd fengshui-ecommerce

# 7. 安装依赖
echo "📦 安装依赖..."
pnpm install --frozen-lockfile

# 8. 配置环境变量
echo "⚙️ 配置环境变量..."
cat > .env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://jinshiying.com
NEXTAUTH_URL=https://jinshiying.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JKOPAY_API_URL=https://gateway.suntone.com/payment/api/gotoPayment
JKOPAY_MERCHANT_ID=1888
JKOPAY_TERMINAL_ID=888506
JKOPAY_SECRET_KEY=fe5b2c5ea084426bb1f6269acbac902f
JKOPAY_RETURN_URL=https://jinshiying.com/payment/return
JKOPAY_NOTIFY_URL=https://jinshiying.com/api/payment/notify
PORT=3000
EOF

# 9. 构建应用
echo "🏗️ 构建应用..."
pnpm run build

# 10. 创建数据目录并初始化数据
mkdir -p data uploads logs
node init-data.js

# 11. 创建systemd服务
echo "⚙️ 创建服务..."
cat > /etc/systemd/system/fengshui-app.service << EOF
[Unit]
Description=Fengshui E-commerce Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/fengshui-ecommerce/fengshui-ecommerce
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/opt/fengshui-ecommerce/fengshui-ecommerce/.env.production
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 12. 启动应用
echo "🚀 启动应用..."
systemctl daemon-reload
systemctl enable fengshui-app
systemctl start fengshui-app

# 13. 配置Nginx
echo "🌐 配置Nginx..."
cat > /etc/nginx/sites-available/jinshiying.com << 'EOF'
server {
    listen 80;
    server_name jinshiying.com www.jinshiying.com 45.77.248.70;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/jinshiying.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# 14. 配置防火墙
echo "🔥 配置防火墙..."
ufw --force enable
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000

# 15. 等待应用启动
echo "⏳ 等待应用启动..."
sleep 10

# 16. 检查状态
echo "🔍 检查状态..."
if systemctl is-active --quiet fengshui-app; then
    echo "✅ 应用运行正常"
else
    echo "❌ 应用启动失败"
    systemctl status fengshui-app --no-pager -l
    exit 1
fi

echo
echo "🎉 部署完成！"
echo
echo "=== 访问信息 ==="
echo "应用地址: http://45.77.248.70"
echo "域名地址: http://jinshiying.com (需要DNS解析)"
echo
echo "=== 管理命令 ==="
echo "查看状态: systemctl status fengshui-app"
echo "查看日志: journalctl -u fengshui-app -f"
echo "重启应用: systemctl restart fengshui-app"
echo "停止应用: systemctl stop fengshui-app"
echo "启动应用: systemctl start fengshui-app"
echo
echo "=== 测试账号 =="
echo "管理员: admin@jinshiying.com / admin123"
echo "测试用户: test@jinshiying.com / test123"
echo
echo "=== 下一步 ==="
echo "1. 确保域名 jinshiying.com 解析到 45.77.248.70"
echo "2. 运行: certbot --nginx -d jinshiying.com -d www.jinshiying.com"
echo "3. 测试所有功能"
