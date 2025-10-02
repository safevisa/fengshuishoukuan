#!/bin/bash

# MySQL数据库安装和配置脚本
# 适用于Ubuntu/Debian系统

echo "🐬 开始安装和配置MySQL数据库..."

# 1. 更新系统包
echo "📦 更新系统包..."
sudo apt update

# 2. 安装MySQL Server
echo "🔧 安装MySQL Server..."
sudo apt install -y mysql-server

# 3. 启动MySQL服务
echo "🚀 启动MySQL服务..."
sudo systemctl start mysql
sudo systemctl enable mysql

# 4. 检查MySQL状态
echo "🔍 检查MySQL状态..."
sudo systemctl status mysql --no-pager

# 5. 安全配置MySQL
echo "🔒 配置MySQL安全设置..."
sudo mysql_secure_installation << 'EOF'
n
password
password
n
n
n
n
y
EOF

# 6. 创建数据库和用户
echo "📊 创建数据库和用户..."
sudo mysql -u root -ppassword << 'EOF'
-- 创建数据库
CREATE DATABASE IF NOT EXISTS fengshui_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER IF NOT EXISTS 'fengshui_user'@'localhost' IDENTIFIED BY 'fengshui_password';
CREATE USER IF NOT EXISTS 'fengshui_user'@'%' IDENTIFIED BY 'fengshui_password';

-- 授权
GRANT ALL PRIVILEGES ON fengshui_ecommerce.* TO 'fengshui_user'@'localhost';
GRANT ALL PRIVILEGES ON fengshui_ecommerce.* TO 'fengshui_user'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 显示数据库
SHOW DATABASES;
EOF

# 7. 创建环境变量文件
echo "📝 创建环境变量配置..."
cat > .env.local << 'EOF'
# MySQL数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=fengshui_user
MYSQL_PASSWORD=fengshui_password
MYSQL_DATABASE=fengshui_ecommerce

# 应用配置
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# 街口支付配置
JKOPAY_API_URL=https://gateway.suntone.com/payment/api/gotoPayment
JKOPAY_MERCHANT_ID=1888
JKOPAY_TERMINAL_ID=888506
JKOPAY_SECRET_KEY=fe5b2c5ea084426bb1f6269acbac902f
JKOPAY_RETURN_URL=http://localhost:3000/payment/return
JKOPAY_NOTIFY_URL=http://localhost:3000/api/payment/notify
EOF

# 8. 初始化数据库表结构
echo "🏗️ 初始化数据库表结构..."
if [ -f "init-database.sql" ]; then
    mysql -u fengshui_user -pfengshui_password fengshui_ecommerce < init-database.sql
    echo "✅ 数据库表结构初始化完成"
else
    echo "⚠️ 未找到init-database.sql文件，请手动创建表结构"
fi

# 9. 测试数据库连接
echo "🧪 测试数据库连接..."
mysql -u fengshui_user -pfengshui_password -e "USE fengshui_ecommerce; SHOW TABLES;"

if [ $? -eq 0 ]; then
    echo "✅ MySQL数据库安装和配置完成！"
    echo ""
    echo "📋 数据库信息："
    echo "  - 主机: localhost"
    echo "  - 端口: 3306"
    echo "  - 数据库: fengshui_ecommerce"
    echo "  - 用户: fengshui_user"
    echo "  - 密码: fengshui_password"
    echo ""
    echo "🔧 下一步："
    echo "  1. 运行: npm run dev"
    echo "  2. 访问: http://localhost:3000"
    echo "  3. 检查数据库连接"
else
    echo "❌ 数据库连接测试失败，请检查配置"
    exit 1
fi
