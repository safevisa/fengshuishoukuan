#!/bin/bash

# 快速修复脚本
# 解决Node.js冲突和完成部署

set -e

echo "🔧 开始快速修复..."

# 1. 强制安装Node.js 18
echo "📦 强制安装Node.js 18..."
apt remove -y libnode-dev libnode72
apt install -y nodejs

# 验证版本
echo "✅ Node.js版本:"
node --version
npm --version

# 2. 重新安装pnpm
echo "📦 重新安装pnpm..."
npm install -g pnpm

# 3. 停止现有应用
echo "⏹️ 停止现有应用..."
pkill -f "pnpm start" || true
sleep 5

# 4. 进入项目目录
cd /root/baijian

# 5. 安装依赖
echo "📦 安装依赖..."
pnpm install

# 6. 构建应用
echo "🔨 构建应用..."
pnpm run build

# 7. 启动应用
echo "🚀 启动应用..."
nohup pnpm start > app.log 2>&1 &

# 等待启动
sleep 30

# 8. 检查应用状态
echo "🔍 检查应用状态..."
ps aux | grep node | grep -v grep
ss -tlnp | grep :3000

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
ps aux | grep node | grep -v grep

echo "端口监听状态:"
ss -tlnp | grep -E ':(80|443|3000)'

echo "HTTP测试:"
curl -I http://jinshiying.com 2>/dev/null | head -1 || echo "HTTP测试失败"

echo "HTTPS测试:"
curl -I https://jinshiying.com 2>/dev/null | head -1 || echo "HTTPS测试失败"

echo ""
echo "🎉 快速修复完成！"
echo "🌐 网站地址: https://jinshiying.com"
echo "📋 管理命令:"
echo "  查看应用日志: tail -f /root/baijian/app.log"
echo "  重启应用: pkill -f 'pnpm start' && cd /root/baijian && nohup pnpm start > app.log 2>&1 &"
echo "  查看Nginx状态: systemctl status nginx"
echo "  查看端口: ss -tlnp | grep -E ':(80|443|3000)'"