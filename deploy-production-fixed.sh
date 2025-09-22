#!/bin/bash

# 生产环境部署脚本 - 修复版本
# 确保所有API、登录和支付功能在真实网络环境中正常工作

set -e

echo "🚀 开始生产环境部署..."

# 1. 更新系统包
echo "📦 更新系统包..."
apt update && apt upgrade -y

# 2. 安装必要工具
echo "🔧 安装必要工具..."
apt install -y curl wget git nginx certbot python3-certbot-nginx

# 3. 安装Docker和Docker Compose
echo "🐳 安装Docker和Docker Compose..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 4. 配置Docker镜像源
echo "🌏 配置Docker镜像源..."
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << EOF
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

systemctl restart docker

# 5. 创建应用目录
echo "📁 创建应用目录..."
mkdir -p /opt/fengshui-ecommerce
cd /opt/fengshui-ecommerce

# 6. 克隆代码（如果不存在）
if [ ! -d "fengshui-ecommerce" ]; then
    echo "📥 克隆代码..."
    git clone https://github.com/safevisa/baijian.git fengshui-ecommerce
fi

cd fengshui-ecommerce

# 7. 配置环境变量
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
DATABASE_URL=postgresql://fengshui_user:$(openssl rand -base64 32)@db:5432/fengshui_ecommerce
REDIS_URL=redis://redis:6379
EOF

# 8. 更新Docker Compose配置
echo "🐳 更新Docker Compose配置..."
cp docker-compose.prod-fixed.yml docker-compose.yml

# 更新数据库密码
DB_PASSWORD=$(grep DATABASE_URL .env.production | cut -d'@' -f1 | cut -d':' -f3)
sed -i "s/your_secure_password_here/$DB_PASSWORD/g" docker-compose.yml

# 9. 构建和启动服务
echo "🏗️ 构建和启动服务..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

# 10. 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 11. 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 12. 配置Nginx
echo "🌐 配置Nginx..."
cat > /etc/nginx/sites-available/jinshiying.com << 'EOF'
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name jinshiying.com www.jinshiying.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name jinshiying.com www.jinshiying.com;

    # SSL证书配置（稍后安装）
    # ssl_certificate /etc/letsencrypt/live/jinshiying.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/jinshiying.com/privkey.pem;

    # 临时自签名证书
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;

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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
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
        add_header X-Content-Type-Options nosniff;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/jinshiying.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t

# 重启Nginx
systemctl restart nginx
systemctl enable nginx

# 13. 配置防火墙
echo "🔥 配置防火墙..."
ufw --force enable
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000

# 14. 安装SSL证书
echo "🔒 安装SSL证书..."
if [ ! -f "/etc/letsencrypt/live/jinshiying.com/fullchain.pem" ]; then
    echo "请确保域名 jinshiying.com 已正确解析到此服务器"
    echo "然后运行以下命令安装SSL证书："
    echo "certbot --nginx -d jinshiying.com -d www.jinshiying.com"
else
    echo "SSL证书已存在，跳过安装"
fi

# 15. 创建系统服务
echo "⚙️ 创建系统服务..."
cat > /etc/systemd/system/fengshui-ecommerce.service << EOF
[Unit]
Description=Fengshui E-commerce Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/fengshui-ecommerce/fengshui-ecommerce
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable fengshui-ecommerce

# 16. 创建监控脚本
echo "📊 创建监控脚本..."
cat > /opt/fengshui-ecommerce/monitor.sh << 'EOF'
#!/bin/bash

echo "=== 系统状态检查 ==="
echo "时间: $(date)"
echo

echo "=== Docker服务状态 ==="
docker-compose ps

echo
echo "=== 应用健康检查 ==="
curl -f http://localhost:3000/api/health || echo "健康检查失败"

echo
echo "=== Nginx状态 ==="
systemctl status nginx --no-pager -l

echo
echo "=== 磁盘使用情况 ==="
df -h

echo
echo "=== 内存使用情况 ==="
free -h

echo
echo "=== 网络连接 ==="
ss -tlnp | grep -E ':(80|443|3000)'
EOF

chmod +x /opt/fengshui-ecommerce/monitor.sh

# 17. 创建备份脚本
echo "💾 创建备份脚本..."
cat > /opt/fengshui-ecommerce/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "开始备份..."

# 备份数据库
docker-compose exec -T db pg_dump -U fengshui_user fengshui_ecommerce > $BACKUP_DIR/database_$DATE.sql

# 备份应用数据
tar -czf $BACKUP_DIR/app_data_$DATE.tar.gz -C /opt/fengshui-ecommerce/fengshui-ecommerce data uploads

# 备份配置文件
tar -czf $BACKUP_DIR/config_$DATE.tar.gz -C /opt/fengshui-ecommerce/fengshui-ecommerce .env.production docker-compose.yml

echo "备份完成: $BACKUP_DIR"
EOF

chmod +x /opt/fengshui-ecommerce/backup.sh

# 18. 最终检查
echo "🔍 最终检查..."
sleep 10

# 检查应用是否运行
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ 应用运行正常"
else
    echo "❌ 应用运行异常"
    docker-compose logs app
fi

# 检查Nginx是否运行
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx运行正常"
else
    echo "❌ Nginx运行异常"
fi

echo
echo "🎉 部署完成！"
echo
echo "=== 访问信息 ==="
echo "应用地址: https://jinshiying.com"
echo "健康检查: https://jinshiying.com/api/health"
echo
echo "=== 管理命令 ==="
echo "查看状态: /opt/fengshui-ecommerce/monitor.sh"
echo "查看日志: docker-compose logs -f"
echo "重启应用: docker-compose restart"
echo "备份数据: /opt/fengshui-ecommerce/backup.sh"
echo
echo "=== 下一步 ==="
echo "1. 确保域名 jinshiying.com 解析到此服务器"
echo "2. 运行: certbot --nginx -d jinshiying.com -d www.jinshiying.com"
echo "3. 测试所有功能：登录、注册、支付、收款链接"
echo
echo "=== 测试账号 ==="
echo "管理员: admin@jinshiying.com / admin123"
echo "测试用户: test@jinshiying.com / test123"
