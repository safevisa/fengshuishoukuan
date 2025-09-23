#!/bin/bash

# 修复部署脚本
# 解决Docker和Node.js版本问题

set -e

echo "🔧 开始修复部署问题..."

# 1. 停止所有服务
echo "⏹️ 停止所有服务..."
systemctl stop nginx 2>/dev/null || true
docker-compose down 2>/dev/null || true

# 2. 修复Docker问题
echo "🐳 修复Docker问题..."
# 删除可能有问题的daemon.json
rm -f /etc/docker/daemon.json

# 重启Docker
systemctl restart docker
systemctl enable docker

# 等待Docker启动
sleep 10

# 检查Docker状态
if ! docker --version >/dev/null 2>&1; then
    echo "❌ Docker仍然无法启动，重新安装..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
    rm get-docker.sh
    systemctl restart docker
    systemctl enable docker
fi

# 3. 升级Node.js到18版本
echo "📦 升级Node.js到18版本..."
# 卸载旧版本
apt remove -y nodejs npm

# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 验证版本
node --version
npm --version

# 4. 重新安装pnpm
echo "📦 重新安装pnpm..."
npm install -g pnpm

# 5. 安装Docker Compose
echo "🐙 安装Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 6. 清理并重新克隆代码
echo "🧹 清理并重新克隆代码..."
rm -rf /root/baijian
cd /root
git clone https://github.com/safevisa/baijian.git
cd baijian

# 7. 创建必要目录
echo "📁 创建必要目录..."
mkdir -p data uploads

# 8. 使用Node.js直接运行（避免Docker问题）
echo "🚀 使用Node.js直接运行..."
cd /root/baijian

# 安装依赖
echo "📦 安装依赖..."
pnpm install

# 构建应用
echo "🔨 构建应用..."
pnpm run build

# 后台启动应用
echo "🚀 启动应用..."
nohup pnpm start > app.log 2>&1 &

# 等待启动
sleep 30

# 检查进程
echo "🔍 检查应用状态..."
ps aux | grep node | grep -v grep || echo "应用未运行"

# 检查端口
echo "🔍 检查端口监听..."
ss -tlnp | grep :3000 || echo "端口3000未监听"

# 9. 配置Nginx
echo "⚙️ 配置Nginx..."
cat > /etc/nginx/sites-available/jinshiying.com << 'EOF'
server {
    listen 80;
    server_name jinshiying.com www.jinshiying.com 45.77.248.70;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
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
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# 10. 启用Nginx站点
echo "🔗 启用Nginx站点..."
ln -sf /etc/nginx/sites-available/jinshiying.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 11. 测试并启动Nginx
echo "🧪 测试Nginx配置..."
nginx -t

echo "🚀 启动Nginx..."
systemctl start nginx
systemctl enable nginx

# 12. 安装SSL证书
echo "🔐 安装SSL证书..."
apt install -y certbot python3-certbot-nginx

# 停止Nginx以获取证书
systemctl stop nginx

# 获取SSL证书
certbot certonly --standalone -d jinshiying.com -d www.jinshiying.com --non-interactive --agree-tos --email admin@jinshiying.com

# 13. 配置HTTPS Nginx
echo "🔒 配置HTTPS Nginx..."
cat > /etc/nginx/sites-available/jinshiying.com << 'EOF'
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name jinshiying.com www.jinshiying.com 45.77.248.70;
    return 301 https://$server_name$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name jinshiying.com www.jinshiying.com 45.77.248.70;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/jinshiying.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jinshiying.com/privkey.pem;

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
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# 14. 测试并启动HTTPS Nginx
echo "🧪 测试HTTPS Nginx配置..."
nginx -t

echo "🚀 启动HTTPS Nginx..."
systemctl start nginx

# 15. 设置SSL证书自动续期
echo "🔄 设置SSL证书自动续期..."
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# 16. 最终测试
echo "🎯 最终测试..."
sleep 10

echo "应用进程状态:"
ps aux | grep node | grep -v grep || echo "应用未运行"

echo "端口监听状态:"
ss -tlnp | grep -E ':(80|443|3000)'

echo "HTTP测试:"
curl -I http://jinshiying.com 2>/dev/null | head -1 || echo "HTTP测试失败"

echo "HTTPS测试:"
curl -I https://jinshiying.com 2>/dev/null | head -1 || echo "HTTPS测试失败"

echo ""
echo "🎉 修复完成！"
echo "🌐 网站地址: https://jinshiying.com"
echo "📋 管理命令:"
echo "  查看应用日志: tail -f /root/baijian/app.log"
echo "  重启应用: pkill -f 'pnpm start' && cd /root/baijian && nohup pnpm start > app.log 2>&1 &"
echo "  查看Nginx状态: systemctl status nginx"
echo "  查看端口: ss -tlnp | grep -E ':(80|443|3000)'"

