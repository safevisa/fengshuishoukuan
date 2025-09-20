# 生产环境部署指南

## 服务器要求

### 推荐配置
- **操作系统**: Ubuntu 22.04 LTS
- **CPU**: 2核心以上
- **内存**: 4GB以上（推荐8GB）
- **存储**: 40GB以上SSD
- **网络**: 1TB流量/月

### 最低配置
- **操作系统**: Ubuntu 20.04 LTS
- **CPU**: 1核心
- **内存**: 2GB
- **存储**: 20GB SSD

## 部署步骤

### 1. 准备服务器

在Vultr上创建Ubuntu 22.04 LTS服务器后：

```bash
# 连接到服务器
ssh root@your-server-ip

# 创建非root用户
adduser fengshui
usermod -aG sudo fengshui
su - fengshui
```

### 2. 上传代码

```bash
# 方法1: 使用Git
git clone https://github.com/your-username/fengshui-ecommerce.git
cd fengshui-ecommerce

# 方法2: 使用SCP上传
# 在本地执行
scp -r ./fengshui-ecommerce fengshui@your-server-ip:/home/fengshui/
```

### 3. 自动部署

```bash
# 给脚本执行权限
chmod +x deploy-production.sh

# 执行部署（替换为您的域名）
./deploy-production.sh yourdomain.com
```

### 4. 安装SSL证书

```bash
# 给脚本执行权限
chmod +x install-ssl.sh

# 安装SSL证书
./install-ssl.sh yourdomain.com
```

## 配置说明

### 环境变量

生产环境需要配置以下环境变量：

```bash
# 街口支付配置
JKOPAY_API_URL=https://gateway.suntone.com/payment/api/gotoPayment
JKOPAY_MERCHANT_ID=1888
JKOPAY_TERMINAL_ID=888506
JKOPAY_SECRET_KEY=fe5b2c5ea084426bb1f6269acbac902f
JKOPAY_RETURN_URL=https://yourdomain.com/payment/return
JKOPAY_NOTIFY_URL=https://yourdomain.com/api/payment/notify

# 数据库配置
POSTGRES_DB=fengshui_ecommerce
POSTGRES_USER=fengshui_user
POSTGRES_PASSWORD=your_secure_password_here
```

### 域名配置

1. **DNS设置**：将域名A记录指向服务器IP
2. **SSL证书**：使用Let's Encrypt免费证书
3. **防火墙**：开放80和443端口

## 服务管理

### 启动服务
```bash
cd /opt/fengshui-ecommerce
docker-compose -f docker-compose.prod.yml up -d
```

### 停止服务
```bash
docker-compose -f docker-compose.prod.yml down
```

### 查看日志
```bash
# 查看所有服务日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs -f app
```

### 重启服务
```bash
docker-compose -f docker-compose.prod.yml restart
```

## 数据备份

### 备份数据库
```bash
# 创建备份目录
mkdir -p /opt/backups

# 备份数据库
docker-compose -f docker-compose.prod.yml exec db pg_dump -U fengshui_user fengshui_ecommerce > /opt/backups/db_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 备份应用数据
```bash
# 备份上传文件
tar -czf /opt/backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz /opt/fengshui-ecommerce/uploads/

# 备份应用数据
tar -czf /opt/backups/app_data_$(date +%Y%m%d_%H%M%S).tar.gz /opt/fengshui-ecommerce/data/
```

## 监控和维护

### 系统监控
```bash
# 查看系统资源使用
htop

# 查看磁盘使用
df -h

# 查看内存使用
free -h
```

### 服务监控
```bash
# 查看Docker容器状态
docker ps

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看服务资源使用
docker stats
```

### 日志轮转
```bash
# 配置Docker日志轮转
sudo tee /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl restart docker
```

## 安全建议

1. **防火墙配置**：只开放必要端口
2. **定期更新**：保持系统和软件最新
3. **密码安全**：使用强密码
4. **SSL证书**：定期检查证书有效期
5. **数据备份**：定期备份重要数据

## 故障排除

### 服务无法启动
```bash
# 查看详细错误信息
docker-compose -f docker-compose.prod.yml logs

# 检查端口占用
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

### 数据库连接问题
```bash
# 检查数据库状态
docker-compose -f docker-compose.prod.yml exec db psql -U fengshui_user -d fengshui_ecommerce -c "SELECT 1;"
```

### SSL证书问题
```bash
# 检查证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew
```

## 联系支持

如果遇到问题，请提供以下信息：
1. 错误日志
2. 系统信息
3. 服务状态
4. 网络配置
