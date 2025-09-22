#!/bin/bash

# 完整修复脚本 - 解决所有部署问题

echo "🔧 开始完整修复..."

# 1. 停止所有相关服务
echo "⏹️ 停止所有相关服务..."
systemctl stop nginx 2>/dev/null || true
systemctl stop fengshui-app 2>/dev/null || true

# 2. 清理所有Node.js进程
echo "🧹 清理所有Node.js进程..."
pkill -f "next-server" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true
pkill -f "node.*baijian" 2>/dev/null || true
sleep 3

# 3. 检查端口状态
echo "🔍 检查端口状态..."
ss -tlnp | grep -E ':(80|443|3000)' || echo "✅ 相关端口已释放"

# 4. 进入项目目录
cd /root/baijian

# 5. 启动应用
echo "🚀 启动应用..."
nohup pnpm start > app.log 2>&1 &
APP_PID=$!
echo "应用进程ID: $APP_PID"

# 6. 等待应用启动
echo "⏳ 等待应用启动..."
sleep 10

# 7. 检查应用状态
echo "🔍 检查应用状态..."
if ps -p $APP_PID > /dev/null 2>&1; then
    echo "✅ 应用进程正在运行"
else
    echo "❌ 应用进程已停止"
    echo "📝 应用日志:"
    tail -20 app.log
    exit 1
fi

# 8. 检查端口监听
echo "🔍 检查端口监听..."
if ss -tlnp | grep :3000 > /dev/null; then
    echo "✅ 端口3000正在监听"
else
    echo "❌ 端口3000未监听"
    echo "📝 应用日志:"
    tail -20 app.log
    exit 1
fi

# 9. 测试应用响应
echo "🌐 测试应用响应..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 应用响应正常"
else
    echo "❌ 应用无响应"
    echo "📝 应用日志:"
    tail -20 app.log
    exit 1
fi

# 10. 配置Nginx
echo "⚙️ 配置Nginx..."
cat > /etc/nginx/sites-available/jinshiying.com << 'EOF'
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name jinshiying.com www.jinshiying.com 198.13.39.114;
    return 301 https://$server_name$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name jinshiying.com www.jinshiying.com 198.13.39.114;

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

# 11. 启用Nginx站点
echo "🔗 启用Nginx站点..."
ln -sf /etc/nginx/sites-available/jinshiying.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 12. 测试Nginx配置
echo "🧪 测试Nginx配置..."
if nginx -t; then
    echo "✅ Nginx配置正确"
else
    echo "❌ Nginx配置错误"
    exit 1
fi

# 13. 启动Nginx
echo "🚀 启动Nginx..."
systemctl start nginx
systemctl enable nginx

# 14. 检查Nginx状态
echo "🔍 检查Nginx状态..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx运行正常"
else
    echo "❌ Nginx启动失败"
    systemctl status nginx --no-pager -l
    exit 1
fi

# 15. 测试HTTP连接
echo "🌐 测试HTTP连接..."
if curl -I http://jinshiying.com 2>/dev/null | head -1 | grep -q "301\|302"; then
    echo "✅ HTTP重定向正常"
else
    echo "❌ HTTP重定向失败"
    curl -I http://jinshiying.com 2>/dev/null | head -5
fi

# 16. 测试HTTPS连接
echo "🔒 测试HTTPS连接..."
if curl -I https://jinshiying.com 2>/dev/null | head -1 | grep -q "200"; then
    echo "✅ HTTPS连接正常"
else
    echo "❌ HTTPS连接失败"
    curl -I https://jinshiying.com 2>/dev/null | head -5
fi

# 17. 创建systemd服务
echo "🔧 创建systemd服务..."
cat > /etc/systemd/system/fengshui-app.service << 'EOF'
[Unit]
Description=Fengshui E-commerce App
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/baijian
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 18. 启用systemd服务
echo "🔧 启用systemd服务..."
systemctl daemon-reload
systemctl enable fengshui-app
systemctl stop fengshui-app 2>/dev/null || true
systemctl start fengshui-app

# 19. 最终状态检查
echo "🎯 最终状态检查..."
echo "📱 应用进程:"
ps aux | grep node | grep -v grep || echo "❌ 没有Node.js进程"

echo "🌐 端口监听:"
ss -tlnp | grep -E ':(80|443|3000)' || echo "❌ 没有相关端口监听"

echo "⚙️ Nginx状态:"
systemctl is-active nginx || echo "❌ Nginx未运行"

echo "🔧 应用服务状态:"
systemctl is-active fengshui-app || echo "❌ 应用服务未运行"

echo ""
echo "🎯 完整修复完成！"
echo "🌐 请访问: https://jinshiying.com"
