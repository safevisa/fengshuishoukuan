# Vultr服务器部署指南

本指南将帮助您在Vultr服务器上部署京世盈风水收款系统。

## 📋 服务器要求

### 最低配置
- **操作系统**: Ubuntu 20.04 LTS 或 22.04 LTS
- **CPU**: 1 vCPU
- **内存**: 1GB RAM
- **存储**: 25GB SSD
- **带宽**: 1TB

### 推荐配置
- **操作系统**: Ubuntu 22.04 LTS
- **CPU**: 2 vCPU
- **内存**: 2GB RAM
- **存储**: 50GB SSD
- **带宽**: 2TB

## 🚀 快速部署

### 方法一：一键部署（推荐）

1. **连接到服务器**
```bash
ssh root@your-server-ip
```

2. **下载并执行快速部署脚本**
```bash
wget https://raw.githubusercontent.com/safevisa/fengshuishoukuan/main/scripts/quick-deploy-vultr.sh
chmod +x quick-deploy-vultr.sh
./quick-deploy-vultr.sh
```

3. **按提示输入配置信息**
   - 域名（如：jinshiying.com）
   - 邮箱（用于SSL证书）
   - 应用端口（默认3000）

### 方法二：完整部署

1. **下载完整部署脚本**
```bash
wget https://raw.githubusercontent.com/safevisa/fengshuishoukuan/main/scripts/deploy-vultr.sh
chmod +x deploy-vultr.sh
```

2. **编辑配置（可选）**
```bash
nano deploy-vultr.sh
```

修改以下变量：
```bash
GITHUB_REPO="https://github.com/safevisa/fengshuishoukuan.git"
DOMAIN="your-domain.com"
EMAIL="your-email@example.com"
PORT=3000
```

3. **执行部署**
```bash
./deploy-vultr.sh
```

## 📝 部署过程说明

部署脚本将自动完成以下操作：

### 1. 系统更新
- 更新Ubuntu系统包
- 安装必要的工具

### 2. 安装Node.js
- 安装Node.js 18.x
- 安装pnpm包管理器

### 3. 安装MySQL
- 安装MySQL 8.0
- 配置安全设置
- 创建应用数据库和用户
- 生成随机密码

### 4. 安装Nginx
- 安装Nginx Web服务器
- 配置反向代理
- 设置安全头

### 5. 安装PM2
- 安装PM2进程管理器
- 配置应用自启动

### 6. 部署应用
- 从GitHub克隆代码
- 安装项目依赖
- 构建生产版本
- 配置环境变量

### 7. 配置数据库
- 执行数据库初始化脚本
- 创建必要的表结构

### 8. 安全配置
- 配置防火墙（UFW）
- 设置SSH安全
- 安装SSL证书

### 9. 监控和备份
- 创建自动备份脚本
- 设置应用监控
- 配置日志轮转

## 🔧 部署后配置

### 1. 访问应用
- 主站：`https://your-domain.com`
- 管理员后台：`https://your-domain.com/admin`
- 用户工作台：`https://your-domain.com/dashboard`

### 2. 默认管理员账号
- 邮箱：`admin@jinshiying.com`
- 密码：`admin123`

### 3. 重要文件位置
```
应用目录：/opt/fengshui-ecommerce
环境配置：/opt/fengshui-ecommerce/.env.local
PM2配置：/opt/fengshui-ecommerce/ecosystem.config.js
Nginx配置：/etc/nginx/sites-available/fengshui-ecommerce
备份目录：/opt/backups
日志目录：/var/log/pm2
```

## 📊 管理命令

### 应用管理
```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs fengshui-ecommerce

# 重启应用
pm2 restart fengshui-ecommerce

# 停止应用
pm2 stop fengshui-ecommerce

# 查看PM2监控
pm2 monit
```

### 服务管理
```bash
# Nginx状态
systemctl status nginx
systemctl restart nginx

# MySQL状态
systemctl status mysql
systemctl restart mysql

# 查看防火墙状态
ufw status
```

### 数据库管理
```bash
# 连接MySQL
mysql -u fengshui_user -p fengshui_ecommerce

# 备份数据库
mysqldump -u fengshui_user -p fengshui_ecommerce > backup.sql

# 恢复数据库
mysql -u fengshui_user -p fengshui_ecommerce < backup.sql
```

## 🔄 应用更新

### 自动更新
```bash
# 下载更新脚本
wget https://raw.githubusercontent.com/safevisa/fengshuishoukuan/main/scripts/update-app.sh
chmod +x update-app.sh

# 执行更新
./update-app.sh
```

### 手动更新
```bash
# 切换到应用目录
cd /opt/fengshui-ecommerce

# 停止应用
pm2 stop fengshui-ecommerce

# 拉取最新代码
git pull origin main

# 安装依赖
pnpm install --production

# 构建应用
pnpm run build

# 重启应用
pm2 restart fengshui-ecommerce
```

## 🔐 安全配置

### 1. SSH安全
- 修改SSH端口（可选）
- 禁用root登录（可选）
- 使用密钥认证（推荐）

### 2. 防火墙配置
```bash
# 查看防火墙状态
ufw status

# 允许特定IP访问SSH
ufw allow from your-ip to any port 22

# 拒绝其他IP访问SSH
ufw deny 22
```

### 3. SSL证书
- 自动使用Let's Encrypt证书
- 自动续期配置
- 强制HTTPS重定向

## 📈 监控和维护

### 1. 日志监控
```bash
# 查看应用日志
tail -f /var/log/pm2/fengshui-ecommerce-out.log
tail -f /var/log/pm2/fengshui-ecommerce-error.log

# 查看Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 查看系统日志
journalctl -u nginx -f
journalctl -u mysql -f
```

### 2. 性能监控
```bash
# 查看系统资源
htop
df -h
free -h

# 查看端口占用
netstat -tlnp
lsof -i :3000
```

### 3. 自动备份
- 数据库每日自动备份
- 应用文件每日自动备份
- 保留7天备份文件

## 🚨 故障排除

### 常见问题

1. **应用无法启动**
```bash
# 查看错误日志
pm2 logs fengshui-ecommerce --lines 100

# 检查端口占用
lsof -i :3000

# 重启应用
pm2 restart fengshui-ecommerce
```

2. **数据库连接失败**
```bash
# 检查MySQL状态
systemctl status mysql

# 检查数据库配置
cat /opt/fengshui-ecommerce/.env.local | grep MYSQL

# 重启MySQL
systemctl restart mysql
```

3. **Nginx配置错误**
```bash
# 测试Nginx配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log

# 重载Nginx
systemctl reload nginx
```

4. **SSL证书问题**
```bash
# 检查证书状态
certbot certificates

# 手动续期
certbot renew

# 强制续期
certbot renew --force-renewal
```

### 性能优化

1. **提高MySQL性能**
```bash
# 编辑MySQL配置
nano /etc/mysql/mysql.conf.d/mysqld.cnf

# 添加以下配置
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
```

2. **优化Nginx性能**
```bash
# 编辑Nginx配置
nano /etc/nginx/nginx.conf

# 调整worker进程数
worker_processes auto;
worker_connections 1024;
```

3. **启用Gzip压缩**
```bash
# 在Nginx配置中添加
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

## 📞 技术支持

如果遇到问题，请：

1. 查看日志文件
2. 检查系统资源使用情况
3. 验证网络连接
4. 联系技术支持

### 联系方式
- GitHub Issues: [项目Issues页面](https://github.com/safevisa/fengshuishoukuan/issues)
- 邮箱: support@jinshiying.com
- 官网: https://jinshiying.com

---

**注意**: 部署前请确保您有服务器的root权限，并已准备好域名和SSL证书所需的邮箱地址。
