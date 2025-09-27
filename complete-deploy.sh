#!/bin/bash

# 完整的风水摆件电商系统部署脚本
# 使用方法: ./complete-deploy.sh yourdomain.com

set -e

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
    echo "使用方法: ./complete-deploy.sh yourdomain.com"
    exit 1
fi

echo "🚀 开始完整部署风水摆件电商系统到: $DOMAIN"

# 1. 更新系统
echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 2. 安装必要工具
echo "🔧 安装必要工具..."
sudo apt install -y curl wget git unzip nginx ufw

# 3. 安装Docker
echo "🐳 安装Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# 4. 安装Docker Compose
echo "🐙 安装Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 5. 停止现有服务
echo "⏹️ 停止现有服务..."
sudo systemctl stop nginx 2>/dev/null || true
docker-compose down 2>/dev/null || true

# 6. 清理旧代码
echo "🧹 清理旧代码..."
rm -rf /root/baijian

# 7. 克隆最新代码
echo "📥 克隆最新代码..."
git clone https://github.com/safevisa/baijian.git
cd baijian

# 8. 创建必要目录
echo "📁 创建必要目录..."
mkdir -p data uploads

# 9. 配置防火墙
echo "🔥 配置防火墙..."
sudo ufw --force enable
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000

# 10. 配置Nginx (HTTP)
echo "⚙️ 配置Nginx..."
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
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

# 11. 启用Nginx站点
echo "🔗 启用Nginx站点..."
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 12. 测试Nginx配置
echo "🧪 测试Nginx配置..."
sudo nginx -t

# 13. 启动Nginx
echo "🚀 启动Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# 14. 启动Docker服务
echo "🐳 启动Docker服务..."
docker-compose -f docker-compose.prod-fixed.yml up -d --build

# 15. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 16. 检查服务状态
echo "🔍 检查服务状态..."
echo "Docker容器状态:"
docker ps

echo "Nginx状态:"
sudo systemctl status nginx --no-pager

echo "端口监听状态:"
sudo ss -tlnp | grep -E ':(80|3000|443)'

# 17. 测试HTTP访问
echo "🌐 测试HTTP访问..."
if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN | grep -q "200\|302"; then
    echo "✅ HTTP访问正常"
else
    echo "❌ HTTP访问失败，请检查配置"
fi

# 18. 安装SSL证书
echo "🔐 安装SSL证书..."
sudo apt install -y certbot python3-certbot-nginx

# 停止Nginx以获取证书
sudo systemctl stop nginx

# 获取SSL证书
sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# 19. 配置HTTPS Nginx
echo "🔒 配置HTTPS Nginx..."
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

# 20. 测试并启动HTTPS Nginx
echo "🧪 测试HTTPS Nginx配置..."
sudo nginx -t

echo "🚀 启动HTTPS Nginx..."
sudo systemctl start nginx

# 21. 设置SSL证书自动续期
echo "🔄 设置SSL证书自动续期..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# 22. 最终测试
echo "🎯 最终测试..."
sleep 10

echo "HTTP测试:"
curl -I http://$DOMAIN 2>/dev/null | head -1 || echo "HTTP测试失败"

echo "HTTPS测试:"
curl -I https://$DOMAIN 2>/dev/null | head -1 || echo "HTTPS测试失败"

echo "端口监听状态:"
sudo ss -tlnp | grep -E ':(80|443|3000)'

# 23. 显示部署信息
echo ""
echo "🎉 部署完成！"
echo "🌐 网站地址: https://$DOMAIN"
echo "🔐 SSL证书已安装并配置自动续期"
echo "🐳 Docker服务已启动"
echo "⚙️ Nginx已配置并运行"
echo ""
echo "📋 管理命令:"
echo "  查看Docker状态: docker ps"
echo "  查看Nginx状态: sudo systemctl status nginx"
echo "  重启服务: docker-compose -f docker-compose.prod-fixed.yml restart"
echo "  查看日志: docker-compose -f docker-compose.prod-fixed.yml logs -f"
echo ""
echo "🔧 故障排除:"
echo "  检查端口: sudo ss -tlnp | grep -E ':(80|443|3000)'"
echo "  测试连接: curl -I https://$DOMAIN"
echo "  查看Nginx日志: sudo tail -f /var/log/nginx/error.log"
echo "  查看应用日志: docker-compose -f docker-compose.prod-fixed.yml logs app"


