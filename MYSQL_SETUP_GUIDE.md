# MySQL数据库安装和配置指南

## 🎯 概述

本指南将帮助您在风水摆件电商系统中安装和配置MySQL数据库。

## 📋 系统要求

- **操作系统**: Ubuntu 20.04+ / Debian 10+ / CentOS 7+
- **内存**: 最少2GB，推荐4GB+
- **存储**: 最少10GB可用空间
- **网络**: 稳定的网络连接

## 🚀 快速安装

### 方法1: 使用Docker（推荐）

```bash
# 1. 启动MySQL容器
npm run mysql:start

# 2. 检查容器状态
docker ps

# 3. 查看日志
npm run mysql:logs
```

### 方法2: 本地安装

```bash
# 1. 运行安装脚本
npm run mysql:install

# 2. 初始化数据库
npm run db:init

# 3. 测试连接
npm run db:test
```

## 🔧 手动安装步骤

### 1. 安装MySQL Server

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y mysql-server

# CentOS/RHEL
sudo yum install -y mysql-server
# 或
sudo dnf install -y mysql-server
```

### 2. 启动MySQL服务

```bash
# 启动服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 检查状态
sudo systemctl status mysql
```

### 3. 安全配置

```bash
# 运行安全配置脚本
sudo mysql_secure_installation
```

### 4. 创建数据库和用户

```sql
-- 登录MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE fengshui_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'fengshui_user'@'localhost' IDENTIFIED BY 'fengshui_password';
CREATE USER 'fengshui_user'@'%' IDENTIFIED BY 'fengshui_password';

-- 授权
GRANT ALL PRIVILEGES ON fengshui_ecommerce.* TO 'fengshui_user'@'localhost';
GRANT ALL PRIVILEGES ON fengshui_ecommerce.* TO 'fengshui_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 5. 初始化数据库表结构

```bash
# 使用SQL文件初始化
mysql -u fengshui_user -pfengshui_password fengshui_ecommerce < init-database.sql
```

## ⚙️ 环境配置

### 1. 创建环境变量文件

```bash
# 复制示例文件
cp env.mysql.example .env.local

# 编辑配置
nano .env.local
```

### 2. 环境变量说明

```bash
# MySQL数据库配置
MYSQL_HOST=localhost          # 数据库主机
MYSQL_PORT=3306              # 数据库端口
MYSQL_USER=fengshui_user     # 数据库用户名
MYSQL_PASSWORD=fengshui_password  # 数据库密码
MYSQL_DATABASE=fengshui_ecommerce  # 数据库名称

# 应用配置
NODE_ENV=development         # 运行环境
JWT_SECRET=your-secret-key   # JWT密钥
```

## 🧪 测试连接

### 1. 使用Node.js测试

```bash
# 运行测试脚本
npm run db:test

# 或直接运行
node scripts/test-database.js
```

### 2. 使用MySQL客户端测试

```bash
# 连接数据库
mysql -u fengshui_user -pfengshui_password fengshui_ecommerce

# 查看表
SHOW TABLES;

# 查看用户表
SELECT * FROM users LIMIT 5;

# 退出
EXIT;
```

## 📊 数据库表结构

### 主要表

1. **users** - 用户表
2. **payment_links** - 支付链接表
3. **orders** - 订单表
4. **payments** - 支付记录表
5. **withdrawals** - 提现记录表

### 表关系

```
users (1) -----> (N) payment_links
users (1) -----> (N) orders
users (1) -----> (N) withdrawals
orders (1) -----> (N) payments
payment_links (1) -----> (N) orders
```

## 🔧 常用操作

### 启动服务

```bash
# Docker方式
npm run mysql:start

# 系统服务方式
sudo systemctl start mysql
```

### 停止服务

```bash
# Docker方式
npm run mysql:stop

# 系统服务方式
sudo systemctl stop mysql
```

### 查看日志

```bash
# Docker方式
npm run mysql:logs

# 系统服务方式
sudo journalctl -u mysql -f
```

### 备份数据库

```bash
# 备份
mysqldump -u fengshui_user -pfengshui_password fengshui_ecommerce > backup.sql

# 恢复
mysql -u fengshui_user -pfengshui_password fengshui_ecommerce < backup.sql
```

## 🚨 故障排除

### 常见问题

1. **连接被拒绝**
   ```bash
   # 检查MySQL服务状态
   sudo systemctl status mysql
   
   # 检查端口监听
   sudo netstat -tlnp | grep 3306
   ```

2. **权限错误**
   ```sql
   -- 重新授权
   GRANT ALL PRIVILEGES ON fengshui_ecommerce.* TO 'fengshui_user'@'%';
   FLUSH PRIVILEGES;
   ```

3. **字符集问题**
   ```sql
   -- 修改数据库字符集
   ALTER DATABASE fengshui_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 日志查看

```bash
# MySQL错误日志
sudo tail -f /var/log/mysql/error.log

# 系统日志
sudo journalctl -u mysql -f
```

## 📈 性能优化

### 1. 配置优化

编辑 `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
# 基本配置
max_connections = 200
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2

# 字符集
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

### 2. 重启服务

```bash
sudo systemctl restart mysql
```

## 🔒 安全建议

1. **修改默认密码**
2. **限制远程访问**
3. **定期备份数据**
4. **监控数据库性能**
5. **更新MySQL版本**

## 📞 支持

如果遇到问题，请：

1. 查看错误日志
2. 检查网络连接
3. 验证配置参数
4. 联系技术支持

---

**最后更新**: 2025-09-28  
**版本**: v1.0  
**维护者**: 开发团队
