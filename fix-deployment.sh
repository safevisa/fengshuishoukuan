#!/bin/bash

echo "🔧 修复生产环境部署配置..."

# 1. 停止当前服务
echo "📦 停止当前Docker服务..."
docker-compose -f docker-compose.prod.yml down

# 2. 备份原配置文件
echo "💾 备份原配置文件..."
cp docker-compose.prod.yml docker-compose.prod.yml.backup
cp /etc/nginx/sites-available/jinshiying.com /etc/nginx/sites-available/jinshiying.com.backup

# 3. 创建修复后的Docker配置
echo "🐳 创建修复后的Docker配置..."
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "0.0.0.0:3000:3000"
    environment:
      - NODE_ENV=production
      - JKOPAY_API_URL=https://gateway.suntone.com/payment/api/gotoPayment
      - JKOPAY_MERCHANT_ID=1888
      - JKOPAY_TERMINAL_ID=888506
      - JKOPAY_SECRET_KEY=fe5b2c5ea084426bb1f6269acbac902f
      - JKOPAY_RETURN_URL=http://198.13.39.114/payment/return
      - JKOPAY_NOTIFY_URL=http://198.13.39.114/api/payment/notify
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
    restart: unless-stopped
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=fengshui_ecommerce
      - POSTGRES_USER=fengshui_user
      - POSTGRES_PASSWORD=your_secure_password_here
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
EOF

# 4. 创建修复后的Nginx配置
echo "🌐 创建修复后的Nginx配置..."
sudo tee /etc/nginx/sites-available/jinshiying.com > /dev/null << 'EOF'
server {
    listen 80;
    server_name jinshiying.com www.jinshiying.com 198.13.39.114;
    
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
    }
    
    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 5. 测试Nginx配置
echo "🔍 测试Nginx配置..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx配置测试通过"
    
    # 6. 重启Nginx
    echo "🔄 重启Nginx..."
    sudo systemctl restart nginx
    
    # 7. 启动Docker服务
    echo "🚀 启动Docker服务..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # 8. 等待服务启动
    echo "⏳ 等待服务启动..."
    sleep 10
    
    # 9. 检查服务状态
    echo "📊 检查服务状态..."
    echo "=== Docker容器状态 ==="
    docker ps
    
    echo "=== Nginx状态 ==="
    sudo systemctl status nginx --no-pager
    
    echo "=== 端口监听状态 ==="
    sudo ss -tlnp | grep -E ':(80|3000)'
    
    # 10. 测试访问
    echo "🧪 测试访问..."
    echo "测试本地应用:"
    curl -s http://localhost:3000 | head -5
    
    echo "测试Nginx代理:"
    curl -s http://localhost | head -5
    
    echo "测试外部访问:"
    curl -s http://198.13.39.114 | head -5
    
    echo ""
    echo "🎉 部署修复完成！"
    echo "🌐 您的网站现在可以通过以下地址访问："
    echo "   - http://198.13.39.114"
    echo "   - http://jinshiying.com (如果域名已解析)"
    
else
    echo "❌ Nginx配置测试失败，请检查配置"
    exit 1
fi
