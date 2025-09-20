#!/bin/bash

# SSL证书安装脚本
# 使用方法: ./install-ssl.sh yourdomain.com

set -e

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
    echo "使用方法: ./install-ssl.sh yourdomain.com"
    exit 1
fi

echo "🔐 为 $DOMAIN 安装SSL证书..."

# 安装Certbot
echo "📦 安装Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# 停止Nginx
echo "⏹️ 停止Nginx..."
sudo systemctl stop nginx

# 获取SSL证书
echo "🔑 获取SSL证书..."
sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# 更新Nginx配置
echo "⚙️ 更新Nginx配置..."
sudo tee /etc/nginx/sites-available/fengshui-ecommerce << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # 重定向到HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL配置
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
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 测试Nginx配置
sudo nginx -t

# 启动Nginx
echo "🚀 启动Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# 设置自动续期
echo "🔄 设置SSL证书自动续期..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

echo "✅ SSL证书安装完成！"
echo "🌐 访问地址: https://$DOMAIN"
echo "🔐 SSL证书将自动续期"
