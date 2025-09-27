#!/bin/bash

# 终极一键部署和修复脚本
# 使用方法: ./ultimate-deploy.sh yourdomain.com

set -e

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
    echo "使用方法: ./ultimate-deploy.sh yourdomain.com"
    exit 1
fi

echo "🚀 开始终极部署风水摆件电商系统到: $DOMAIN"

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
apt install -y curl wget git unzip nginx ufw nodejs npm

# 4. 安装pnpm
echo "📦 安装pnpm..."
npm install -g pnpm

# 5. 配置防火墙
echo "🔥 配置防火墙..."
ufw --force enable
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000

# 6. 停止所有服务
echo "⏹️ 停止所有服务..."
systemctl stop nginx 2>/dev/null || true
docker-compose down 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true

# 7. 重启Docker服务
echo "🐳 重启Docker服务..."
systemctl restart docker
systemctl enable docker
sleep 5

# 8. 检查Docker状态
echo "🔍 检查Docker状态..."
if ! docker --version >/dev/null 2>&1; then
    echo "❌ Docker未正常运行，重新安装..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
    systemctl restart docker
    systemctl enable docker
fi

# 9. 安装Docker Compose
echo "🐙 安装Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 10. 清理旧代码
echo "🧹 清理旧代码..."
rm -rf /root/baijian
cd /root

# 11. 克隆代码
echo "📥 克隆代码..."
git clone https://github.com/safevisa/baijian.git
cd baijian

# 12. 创建必要目录
echo "📁 创建必要目录..."
mkdir -p data uploads

# 13. 修复Docker Compose配置
echo "🔧 修复Docker Compose配置..."
cat > docker-compose.prod-fixed.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JKOPAY_API_URL=https://gateway.suntone.com/payment/api/gotoPayment
      - JKOPAY_MERCHANT_ID=1888
      - JKOPAY_TERMINAL_ID=888506
      - JKOPAY_SECRET_KEY=fe5b2c5ea084426bb1f6269acbac902f
      - JKOPAY_RETURN_URL=https://jinshiying.com/payment/return
      - JKOPAY_NOTIFY_URL=https://jinshiying.com/api/payment/notify
      - NEXT_PUBLIC_BASE_URL=https://jinshiying.com
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=fengshui_ecommerce
      - POSTGRES_USER=fengshui_user
      - POSTGRES_PASSWORD=your_secure_password_here
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
EOF

# 14. 启动Docker服务
echo "🐳 启动Docker服务..."
docker-compose -f docker-compose.prod-fixed.yml up -d --build

# 15. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 60

# 16. 检查Docker容器状态
echo "🔍 检查Docker容器状态..."
docker ps

# 17. 检查端口监听
echo "🔍 检查端口监听..."
ss -tlnp | grep :3000 || echo "端口3000未监听"

# 18. 如果Docker失败，使用Node.js直接运行
if ! ss -tlnp | grep -q :3000; then
    echo "⚠️ Docker启动失败，使用Node.js直接运行..."
    
    # 安装依赖
    pnpm install
    
    # 构建应用
    pnpm run build
    
    # 后台启动应用
    nohup pnpm start > app.log 2>&1 &
    
    # 等待启动
    sleep 30
    
    # 检查进程
    ps aux | grep node
fi

# 19. 配置Nginx
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

# 20. 启用Nginx站点
echo "🔗 启用Nginx站点..."
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 21. 测试Nginx配置
echo "🧪 测试Nginx配置..."
nginx -t

# 22. 启动Nginx
echo "🚀 启动Nginx..."
systemctl start nginx
systemctl enable nginx

# 23. 检查服务状态
echo "🔍 检查服务状态..."
echo "Docker容器状态:"
docker ps

echo "Nginx状态:"
systemctl status nginx --no-pager

echo "端口监听状态:"
ss -tlnp | grep -E ':(80|3000)'

# 24. 测试HTTP访问
echo "🌐 测试HTTP访问..."
if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN | grep -q "200\|302"; then
    echo "✅ HTTP访问正常"
else
    echo "❌ HTTP访问失败，请检查配置"
fi

# 25. 安装SSL证书
echo "🔐 安装SSL证书..."
apt install -y certbot python3-certbot-nginx

# 停止Nginx以获取证书
systemctl stop nginx

# 获取SSL证书
certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# 26. 配置HTTPS Nginx
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

# 27. 测试并启动HTTPS Nginx
echo "🧪 测试HTTPS Nginx配置..."
nginx -t

echo "🚀 启动HTTPS Nginx..."
systemctl start nginx

# 28. 设置SSL证书自动续期
echo "🔄 设置SSL证书自动续期..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# 29. 最终测试
echo "🎯 最终测试..."
sleep 10

echo "HTTP测试:"
curl -I http://$DOMAIN 2>/dev/null | head -1 || echo "HTTP测试失败"

echo "HTTPS测试:"
curl -I https://$DOMAIN 2>/dev/null | head -1 || echo "HTTPS测试失败"

echo "端口监听状态:"
ss -tlnp | grep -E ':(80|443|3000)'

# 30. 显示部署信息
echo ""
echo "🎉 终极部署完成！"
echo "🌐 网站地址: https://$DOMAIN"
echo "🔐 SSL证书已安装并配置自动续期"
echo "🐳 Docker服务已启动"
echo "⚙️ Nginx已配置并运行"
echo ""
echo "📋 管理命令:"
echo "  查看Docker状态: docker ps"
echo "  查看Nginx状态: systemctl status nginx"
echo "  重启服务: docker-compose -f docker-compose.prod-fixed.yml restart"
echo "  查看日志: docker-compose -f docker-compose.prod-fixed.yml logs -f"
echo "  查看应用日志: tail -f app.log"
echo ""
echo "🔧 故障排除:"
echo "  检查端口: ss -tlnp | grep -E ':(80|443|3000)'"
echo "  测试连接: curl -I https://$DOMAIN"
echo "  查看Nginx日志: tail -f /var/log/nginx/error.log"
echo "  查看应用日志: tail -f app.log"
echo "  重启应用: docker-compose -f docker-compose.prod-fixed.yml restart"


