# 风水摆件电商系统 - 部署指南

## 概述
本指南详细说明如何将风水摆件电商系统部署到生产环境。

## 系统要求

### 服务器要求
- **操作系统**: Ubuntu 22.04.5 LTS
- **内存**: 最少 2GB RAM
- **存储**: 最少 20GB 可用空间
- **网络**: 公网IP地址

### 软件要求
- **Node.js**: 18.x 或更高版本
- **pnpm**: 包管理器
- **Nginx**: Web服务器
- **Docker**: 容器化部署（可选）
- **SSL证书**: Let's Encrypt

## 部署步骤

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装pnpm
npm install -g pnpm
```

### 2. 项目部署

```bash
# 创建项目目录
sudo mkdir -p /opt/fengshui-ecommerce
sudo chown $USER:$USER /opt/fengshui-ecommerce
cd /opt/fengshui-ecommerce

# 克隆项目（或上传文件）
git clone https://github.com/your-username/fengshui-ecommerce.git .
# 或者直接上传项目文件

# 安装依赖
pnpm install

# 复制环境配置
cp env.production .env.production

# 构建项目
pnpm run build
```

### 3. 环境配置

编辑 `.env.production` 文件：

```bash
# 生产环境配置
NODE_ENV=production

# Next.js配置
NEXTAUTH_URL=https://jinshiying.com
NEXTAUTH_SECRET=your-production-secret-key-here

# 街口支付配置
JKOPAY_MERCHANT_ID=1888
JKOPAY_TERMINAL_ID=888506
JKOPAY_SECRET_KEY=fe5b2c5ea084426bb1f6269acbac902f
JKOPAY_API_URL=https://gateway.suntone.com/payment/api/gotoPayment
JKOPAY_RETURN_URL=https://jinshiying.com/payment/return
JKOPAY_NOTIFY_URL=https://jinshiying.com/api/payment/notify
JKOPAY_QUERY_URL=https://gateway.suntone.com/payment/api/queryOrder
JKOPAY_TRANSACTION_LIST_URL=https://gateway.suntone.com/payment/api/transactionList

# 应用配置
PORT=3000
HOST=0.0.0.0
```

### 4. 创建系统服务

创建 `/etc/systemd/system/fengshui-app.service` 文件：

```ini
[Unit]
Description=Fengshui Ecommerce App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/fengshui-ecommerce
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable fengshui-app
sudo systemctl start fengshui-app
sudo systemctl status fengshui-app
```

### 5. Nginx配置

创建 `/etc/nginx/sites-available/jinshiying.com` 文件：

```nginx
server {
    listen 80;
    server_name jinshiying.com www.jinshiying.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/jinshiying.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL证书配置

```bash
# 获取SSL证书
sudo certbot --nginx -d jinshiying.com -d www.jinshiying.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. 防火墙配置

```bash
# 允许HTTP和HTTPS流量
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

## 部署脚本

### 快速部署脚本

创建 `quick-deploy.sh`：

```bash
#!/bin/bash
echo "🚀 开始快速部署..."

# 拉取最新代码
cd /opt/fengshui-ecommerce
git pull origin main

# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 重启服务
sudo systemctl restart fengshui-app
sudo systemctl restart nginx

echo "✅ 部署完成！"
```

### 完整部署脚本

创建 `complete-deploy.sh`：

```bash
#!/bin/bash
echo "🚀 开始完整部署..."

# 检查系统要求
echo "📋 检查系统要求..."
node --version
pnpm --version
nginx -v

# 更新代码
echo "📥 更新代码..."
cd /opt/fengshui-ecommerce
git pull origin main

# 安装依赖
echo "📦 安装依赖..."
pnpm install --production

# 构建项目
echo "🔨 构建项目..."
pnpm run build

# 重启服务
echo "🔄 重启服务..."
sudo systemctl restart fengshui-app
sudo systemctl restart nginx

# 检查服务状态
echo "📊 检查服务状态..."
sudo systemctl status fengshui-app --no-pager -l
sudo systemctl status nginx --no-pager -l

echo "✅ 部署完成！"
echo "🌐 访问地址: https://jinshiying.com"
```

## 监控和维护

### 日志监控

```bash
# 应用日志
sudo journalctl -u fengshui-app -f

# Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 系统日志
sudo journalctl -f
```

### 性能监控

```bash
# 系统资源
htop
df -h
free -h

# 网络连接
netstat -tulpn
ss -tulpn
```

### 数据备份

```bash
# 备份数据目录
tar -czf backup-$(date +%Y%m%d).tar.gz /opt/fengshui-ecommerce/data/

# 备份配置文件
tar -czf config-backup-$(date +%Y%m%d).tar.gz /etc/nginx/sites-available/jinshiying.com /etc/systemd/system/fengshui-app.service
```

## 故障排除

### 常见问题

1. **502 Bad Gateway**
   ```bash
   # 检查应用是否运行
   sudo systemctl status fengshui-app
   
   # 检查端口是否被占用
   sudo netstat -tulpn | grep :3000
   
   # 重启服务
   sudo systemctl restart fengshui-app
   ```

2. **SSL证书问题**
   ```bash
   # 检查证书状态
   sudo certbot certificates
   
   # 手动续期
   sudo certbot renew
   
   # 重新配置Nginx
   sudo certbot --nginx -d jinshiying.com
   ```

3. **支付功能问题**
   ```bash
   # 检查环境变量
   cat .env.production | grep JKOPAY
   
   # 检查API连接
   curl -X GET "https://jinshiying.com/api/admin/check-data-apis"
   ```

### 性能优化

1. **启用Gzip压缩**
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   ```

2. **设置缓存**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **数据库优化**
   - 定期清理日志文件
   - 监控内存使用情况
   - 设置数据备份策略

## 安全配置

### 防火墙设置

```bash
# 只允许必要端口
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### SSL配置

```nginx
# 强制HTTPS
server {
    listen 80;
    server_name jinshiying.com www.jinshiying.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name jinshiying.com www.jinshiying.com;
    
    ssl_certificate /etc/letsencrypt/live/jinshiying.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jinshiying.com/privkey.pem;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # 其他配置...
}
```

## 更新和维护

### 定期维护任务

1. **每周检查**
   - 系统更新
   - 日志清理
   - 性能监控

2. **每月检查**
   - SSL证书状态
   - 数据备份
   - 安全更新

3. **每季度检查**
   - 系统升级
   - 配置优化
   - 安全审计

### 更新流程

```bash
# 1. 备份当前版本
cp -r /opt/fengshui-ecommerce /opt/fengshui-ecommerce-backup-$(date +%Y%m%d)

# 2. 拉取最新代码
cd /opt/fengshui-ecommerce
git pull origin main

# 3. 安装新依赖
pnpm install

# 4. 构建新版本
pnpm run build

# 5. 重启服务
sudo systemctl restart fengshui-app

# 6. 验证部署
curl -I https://jinshiying.com
```

## 联系和支持

- **技术支持**: admin@jinshiying.com
- **项目地址**: https://github.com/your-username/fengshui-ecommerce
- **生产环境**: https://jinshiying.com

---

**最后更新**: 2025-09-24  
**版本**: v1.0.0  
**状态**: 生产环境稳定运行

