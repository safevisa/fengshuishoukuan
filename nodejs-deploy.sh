#!/bin/bash

# 纯Node.js部署脚本
# 不使用Docker，直接使用Node.js运行

set -e

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
    echo "使用方法: ./nodejs-deploy.sh yourdomain.com"
    exit 1
fi

echo "🚀 开始纯Node.js部署风水摆件电商系统到: $DOMAIN"

# 1. 禁用IPv6
echo "🔧 禁用IPv6..."
echo "net.ipv6.conf.all.disable_ipv6 = 1" >> /etc/sysctl.conf
echo "net.ipv6.conf.default.disable_ipv6 = 1" >> /etc/sysctl.conf
echo "net.ipv6.conf.lo.disable_ipv6 = 1" >> /etc/sysctl.conf
sysctl -p

# 2. 更新系统
echo "📦 更新系统包..."
apt update && apt upgrade -y

# 3. 安装必要工具
echo "🔧 安装必要工具..."
apt install -y curl wget git unzip nginx ufw

# 4. 安装Node.js 18
echo "📦 安装Node.js 18..."
# 移除旧版本
apt remove -y nodejs npm libnode-dev libnode72 2>/dev/null || true

# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 验证版本
echo "✅ Node.js版本:"
node --version
npm --version

# 5. 安装pnpm
echo "📦 安装pnpm..."
npm install -g pnpm

# 6. 配置防火墙
echo "🔥 配置防火墙..."
ufw --force enable
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000

# 7. 停止所有服务
echo "⏹️ 停止所有服务..."
systemctl stop nginx 2>/dev/null || true
pkill -f "pnpm start" 2>/dev/null || true

# 8. 清理并克隆代码
echo "🧹 清理并克隆代码..."
rm -rf /root/baijian
cd /root
git clone https://github.com/safevisa/baijian.git
cd baijian

# 9. 创建必要目录
echo "📁 创建必要目录..."
mkdir -p data uploads

# 10. 安装依赖
echo "📦 安装依赖..."
pnpm install

# 11. 构建应用
echo "🔨 构建应用..."
pnpm run build

# 12. 创建启动脚本
echo "📝 创建启动脚本..."
cat > /root/baijian/start.sh << 'EOF'
#!/bin/bash
cd /root/baijian
export NODE_ENV=production
export JKOPAY_API_URL=https://gateway.suntone.com/payment/api/gotoPayment
export JKOPAY_MERCHANT_ID=1888
export JKOPAY_TERMINAL_ID=888506
export JKOPAY_SECRET_KEY=fe5b2c5ea084426bb1f6269acbac902f
export JKOPAY_RETURN_URL=https://jinshiying.com/payment/return
export JKOPAY_NOTIFY_URL=https://jinshiying.com/api/payment/notify
export NEXT_PUBLIC_BASE_URL=https://jinshiying.com
nohup pnpm start > app.log 2>&1 &
echo $! > app.pid
EOF

chmod +x /root/baijian/start.sh

# 13. 创建停止脚本
echo "📝 创建停止脚本..."
cat > /root/baijian/stop.sh << 'EOF'
#!/bin/bash
if [ -f /root/baijian/app.pid ]; then
    PID=$(cat /root/baijian/app.pid)
    kill $PID 2>/dev/null || true
    rm -f /root/baijian/app.pid
fi
pkill -f "pnpm start" 2>/dev/null || true
EOF

chmod +x /root/baijian/stop.sh

# 14. 创建重启脚本
echo "📝 创建重启脚本..."
cat > /root/baijian/restart.sh << 'EOF'
#!/bin/bash
cd /root/baijian
./stop.sh
sleep 5
./start.sh
EOF

chmod +x /root/baijian/restart.sh

# 15. 启动应用
echo "🚀 启动应用..."
cd /root/baijian
./start.sh

# 等待启动
sleep 30

# 16. 检查应用状态
echo "🔍 检查应用状态..."
ps aux | grep node | grep -v grep
ss -tlnp | grep :3000

# 17. 配置Nginx
echo "⚙️ 配置Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # 代理到应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# 18. 启用Nginx站点
echo "🔗 启用Nginx站点..."
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 19. 测试并启动Nginx
echo "🧪 测试Nginx配置..."
nginx -t

echo "🚀 启动Nginx..."
systemctl start nginx
systemctl enable nginx

# 20. 安装SSL证书
echo "🔐 安装SSL证书..."
apt install -y certbot python3-certbot-nginx

# 停止Nginx以获取证书
systemctl stop nginx

# 获取SSL证书
certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# 21. 配置HTTPS Nginx
echo "🔒 配置HTTPS Nginx..."
cat > /etc/nginx/sites-available/$DOMAIN << EOF
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 代理到应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# 22. 测试并启动HTTPS Nginx
echo "🧪 测试HTTPS Nginx配置..."
nginx -t

echo "🚀 启动HTTPS Nginx..."
systemctl start nginx

# 23. 设置SSL证书自动续期
echo "🔄 设置SSL证书自动续期..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# 24. 创建systemd服务
echo "📝 创建systemd服务..."
cat > /etc/systemd/system/fengshui-app.service << EOF
[Unit]
Description=Fengshui Ecommerce App
After=network.target

[Service]
Type=forking
User=root
WorkingDirectory=/root/baijian
ExecStart=/root/baijian/start.sh
ExecStop=/root/baijian/stop.sh
ExecReload=/root/baijian/restart.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 25. 启用服务
echo "🔧 启用服务..."
systemctl daemon-reload
systemctl enable fengshui-app.service

# 26. 最终测试
echo "🎯 最终测试..."
sleep 10

echo "应用进程状态:"
ps aux | grep node | grep -v grep

echo "端口监听状态:"
ss -tlnp | grep -E ':(80|443|3000)'

echo "HTTP测试:"
curl -I http://$DOMAIN 2>/dev/null | head -1 || echo "HTTP测试失败"

echo "HTTPS测试:"
curl -I https://$DOMAIN 2>/dev/null | head -1 || echo "HTTPS测试失败"

# 27. 显示部署信息
echo ""
echo "🎉 纯Node.js部署完成！"
echo "🌐 网站地址: https://$DOMAIN"
echo "🔐 SSL证书已安装并配置自动续期"
echo "⚙️ Nginx已配置并运行"
echo ""
echo "📋 管理命令:"
echo "  启动应用: systemctl start fengshui-app"
echo "  停止应用: systemctl stop fengshui-app"
echo "  重启应用: systemctl restart fengshui-app"
echo "  查看状态: systemctl status fengshui-app"
echo "  查看日志: tail -f /root/baijian/app.log"
echo "  手动启动: cd /root/baijian && ./start.sh"
echo "  手动停止: cd /root/baijian && ./stop.sh"
echo "  手动重启: cd /root/baijian && ./restart.sh"
echo ""
echo "🔧 故障排除:"
echo "  检查端口: ss -tlnp | grep -E ':(80|443|3000)'"
echo "  测试连接: curl -I https://$DOMAIN"
echo "  查看Nginx日志: tail -f /var/log/nginx/error.log"
echo "  查看应用日志: tail -f /root/baijian/app.log"


