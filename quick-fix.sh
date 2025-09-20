#!/bin/bash

# 快速修复脚本
# 使用方法: ./quick-fix.sh yourdomain.com

set -e

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
    echo "使用方法: ./quick-fix.sh yourdomain.com"
    exit 1
fi

echo "🔧 开始快速修复..."

# 1. 停止所有服务
echo "⏹️ 停止所有服务..."
sudo systemctl stop nginx 2>/dev/null || true
docker-compose -f docker-compose.prod-fixed.yml down 2>/dev/null || true

# 2. 清理Docker资源
echo "🧹 清理Docker资源..."
docker system prune -f
docker volume prune -f

# 3. 重新拉取代码
echo "📥 重新拉取代码..."
cd /root/baijian
git pull origin main

# 4. 重新构建并启动服务
echo "🐳 重新构建并启动服务..."
docker-compose -f docker-compose.prod-fixed.yml up -d --build --force-recreate

# 5. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 6. 检查Docker服务
echo "🔍 检查Docker服务..."
docker ps

# 7. 重新配置Nginx
echo "⚙️ 重新配置Nginx..."
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << EOF
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
        proxy_pass http://0.0.0.0:3000;
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
        proxy_pass http://0.0.0.0:3000;
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

# 8. 测试Nginx配置
echo "🧪 测试Nginx配置..."
sudo nginx -t

# 9. 启动Nginx
echo "🚀 启动Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# 10. 最终检查
echo "🎯 最终检查..."
sleep 10

echo "端口监听状态:"
sudo ss -tlnp | grep -E ':(80|443|3000)'

echo ""
echo "服务状态:"
docker ps
sudo systemctl status nginx --no-pager

echo ""
echo "连接测试:"
curl -I http://$DOMAIN 2>/dev/null | head -1 || echo "HTTP测试失败"
curl -I https://$DOMAIN 2>/dev/null | head -1 || echo "HTTPS测试失败"

echo ""
echo "✅ 快速修复完成！"
echo "🌐 网站地址: https://$DOMAIN"
