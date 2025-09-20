#!/bin/bash

# 生产环境部署脚本
# 使用方法: ./deploy-production.sh yourdomain.com

set -e

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
    echo "使用方法: ./deploy-production.sh yourdomain.com"
    exit 1
fi

echo "🚀 开始部署到生产环境: $DOMAIN"

# 更新系统
echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 安装必要工具
echo "🔧 安装必要工具..."
sudo apt install -y curl wget git unzip

# 安装Docker
echo "🐳 安装Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# 安装Docker Compose
echo "🐙 安装Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 安装Nginx
echo "🌐 安装Nginx..."
sudo apt install -y nginx

# 配置Nginx
echo "⚙️ 配置Nginx..."
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

    # SSL配置 (需要先获取证书)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # 暂时使用自签名证书
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;

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

# 启用站点
sudo ln -sf /etc/nginx/sites-available/fengshui-ecommerce /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# 创建应用目录
echo "📁 创建应用目录..."
sudo mkdir -p /opt/fengshui-ecommerce
sudo chown $USER:$USER /opt/fengshui-ecommerce

# 复制应用文件
echo "📋 复制应用文件..."
cp -r . /opt/fengshui-ecommerce/
cd /opt/fengshui-ecommerce

# 创建数据目录
mkdir -p data uploads

# 更新生产环境配置
echo "🔧 更新生产环境配置..."
sed -i "s/yourdomain.com/$DOMAIN/g" docker-compose.prod.yml

# 生成随机密码
DB_PASSWORD=$(openssl rand -base64 32)
sed -i "s/your_secure_password_here/$DB_PASSWORD/g" docker-compose.prod.yml

# 启动服务
echo "🚀 启动服务..."
docker-compose -f docker-compose.prod.yml up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ 部署完成！"
echo "🌐 访问地址: https://$DOMAIN"
echo "📊 服务状态: docker-compose -f docker-compose.prod.yml ps"
echo "📝 查看日志: docker-compose -f docker-compose.prod.yml logs -f"

echo ""
echo "🔐 数据库密码: $DB_PASSWORD"
echo "💾 请妥善保存数据库密码！"
