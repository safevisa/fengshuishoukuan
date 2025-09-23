#!/bin/bash

# 优化的部署脚本 - 禁用IPv6，使用国内镜像源
# 使用方法: ./optimized-deploy.sh yourdomain.com

set -e

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
    echo "使用方法: ./optimized-deploy.sh yourdomain.com"
    exit 1
fi

echo "🚀 开始优化部署风水摆件电商系统到: $DOMAIN"

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

# 4. 配置Docker镜像源
echo "🐳 配置Docker镜像源..."
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://ccr.ccs.tencentyun.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ]
}
EOF

# 5. 安装Docker
echo "🐳 安装Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
fi

# 6. 重启Docker应用配置
systemctl restart docker

# 7. 安装Docker Compose
echo "🐙 安装Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 8. 配置防火墙（仅IPv4）
echo "🔥 配置防火墙..."
ufw --force disable
ufw --force enable
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000

# 9. 停止现有服务
echo "⏹️ 停止现有服务..."
systemctl stop nginx 2>/dev/null || true
docker-compose down 2>/dev/null || true

# 10. 清理旧代码
echo "🧹 清理旧代码..."
rm -rf /root/baijian

# 11. 克隆代码
echo "📥 克隆代码..."
git clone https://github.com/safevisa/baijian.git
cd baijian

# 12. 创建必要目录
echo "📁 创建必要目录..."
mkdir -p data uploads

# 13. 配置Nginx（仅IPv4）
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

# 14. 启用Nginx站点
echo "🔗 启用Nginx站点..."
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 15. 测试Nginx配置
echo "🧪 测试Nginx配置..."
nginx -t

# 16. 启动Nginx
echo "🚀 启动Nginx..."
systemctl start nginx
systemctl enable nginx

# 17. 启动Docker服务
echo "🐳 启动Docker服务..."
docker-compose -f docker-compose.prod-fixed.yml up -d --build

# 18. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 19. 检查服务状态
echo "🔍 检查服务状态..."
echo "Docker容器状态:"
docker ps

echo "Nginx状态:"
systemctl status nginx --no-pager

echo "端口监听状态:"
ss -tlnp | grep -E ':(80|3000)'

# 20. 测试HTTP访问
echo "🌐 测试HTTP访问..."
if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN | grep -q "200\|302"; then
    echo "✅ HTTP访问正常"
else
    echo "❌ HTTP访问失败，请检查配置"
fi

# 21. 安装SSL证书
echo "🔐 安装SSL证书..."
apt install -y certbot python3-certbot-nginx

# 停止Nginx以获取证书
systemctl stop nginx

# 获取SSL证书
certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# 22. 配置HTTPS Nginx
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

# 23. 测试并启动HTTPS Nginx
echo "🧪 测试HTTPS Nginx配置..."
nginx -t

echo "🚀 启动HTTPS Nginx..."
systemctl start nginx

# 24. 设置SSL证书自动续期
echo "🔄 设置SSL证书自动续期..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# 25. 最终测试
echo "🎯 最终测试..."
sleep 10

echo "HTTP测试:"
curl -I http://$DOMAIN 2>/dev/null | head -1 || echo "HTTP测试失败"

echo "HTTPS测试:"
curl -I https://$DOMAIN 2>/dev/null | head -1 || echo "HTTPS测试失败"

echo "端口监听状态:"
ss -tlnp | grep -E ':(80|443|3000)'

# 26. 显示部署信息
echo ""
echo "🎉 优化部署完成！"
echo "🌐 网站地址: https://$DOMAIN"
echo "🔐 SSL证书已安装并配置自动续期"
echo "🐳 Docker服务已启动（使用国内镜像源）"
echo "⚙️ Nginx已配置并运行（仅IPv4）"
echo "📊 日志已配置（最大10MB，保留3个文件）"
echo ""
echo "📋 管理命令:"
echo "  查看Docker状态: docker ps"
echo "  查看Nginx状态: systemctl status nginx"
echo "  重启服务: docker-compose -f docker-compose.prod-fixed.yml restart"
echo "  查看日志: docker-compose -f docker-compose.prod-fixed.yml logs -f"
echo ""
echo "🔧 故障排除:"
echo "  检查端口: ss -tlnp | grep -E ':(80|443|3000)'"
echo "  测试连接: curl -I https://$DOMAIN"
echo "  查看Nginx日志: tail -f /var/log/nginx/error.log"
echo "  查看应用日志: docker-compose -f docker-compose.prod-fixed.yml logs app"

