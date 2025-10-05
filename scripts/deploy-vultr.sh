#!/bin/bash

# 京世盈风水收款系统 - Vultr服务器部署脚本
# 适用于Ubuntu 20.04+/22.04+系统
# 支持GitHub仓库自动部署，包含完整的安全配置

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 配置变量 - 请根据实际情况修改
GITHUB_REPO="https://github.com/safevisa/fengshuishoukuan.git"
APP_NAME="fengshui-ecommerce"
APP_DIR="/opt/$APP_NAME"
SERVICE_USER="fengshui"
DOMAIN="jinshiying.com"  # 请修改为您的域名
EMAIL="admin@jinshiying.com"  # 请修改为您的邮箱
PORT=3000

# MySQL配置
MYSQL_ROOT_PASSWORD="$(openssl rand -base64 32)"
MYSQL_DATABASE="fengshui_ecommerce"
MYSQL_USER="fengshui_user"
MYSQL_PASSWORD="$(openssl rand -base64 32)"

# 环境变量文件内容
ENV_CONTENT="
# MySQL数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=$MYSQL_USER
MYSQL_PASSWORD=$MYSQL_PASSWORD
MYSQL_DATABASE=$MYSQL_DATABASE

# 应用配置
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 64)
PORT=$PORT

# 街口支付配置
JKOPAY_API_URL=https://gateway.suntone.com/payment/api/gotoPayment
JKOPAY_MERCHANT_ID=1888
JKOPAY_TERMINAL_ID=888506
JKOPAY_SECRET_KEY=fe5b2c5ea084426bb1f6269acbac902f
JKOPAY_RETURN_URL=https://$DOMAIN/payment/return
JKOPAY_NOTIFY_URL=https://$DOMAIN/api/jkopay/callback
JKOPAY_MER_MGR_URL=https://$DOMAIN

# 网站配置
NEXT_PUBLIC_APP_NAME=京世盈风水
NEXT_PUBLIC_APP_URL=https://$DOMAIN
"

# 检查是否为root用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要root权限运行"
        log_info "请使用: sudo $0"
        exit 1
    fi
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    apt update && apt upgrade -y
    apt install -y curl wget git unzip software-properties-common
}

# 安装Node.js
install_nodejs() {
    log_info "安装Node.js..."
    
    # 下载并安装Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    # 验证安装
    node_version=$(node -v)
    npm_version=$(npm -v)
    log_success "Node.js版本: $node_version"
    log_success "npm版本: $npm_version"
    
    # 安装pnpm
    npm install -g pnpm
    pnpm_version=$(pnpm -v)
    log_success "pnpm版本: $pnpm_version"
}

# 安装MySQL
install_mysql() {
    log_info "安装MySQL..."
    
    # 安装MySQL Server
    apt install -y mysql-server
    
    # 启动并启用MySQL服务
    systemctl start mysql
    systemctl enable mysql
    
    # 安全配置MySQL
    log_info "配置MySQL安全设置..."
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASSWORD';"
    mysql -e "DELETE FROM mysql.user WHERE User='';"
    mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
    mysql -e "DROP DATABASE IF EXISTS test;"
    mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
    mysql -e "FLUSH PRIVILEGES;"
    
    # 创建应用数据库和用户
    mysql -u root -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS $MYSQL_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql -u root -p$MYSQL_ROOT_PASSWORD -e "CREATE USER IF NOT EXISTS '$MYSQL_USER'@'localhost' IDENTIFIED BY '$MYSQL_PASSWORD';"
    mysql -u root -p$MYSQL_ROOT_PASSWORD -e "GRANT ALL PRIVILEGES ON $MYSQL_DATABASE.* TO '$MYSQL_USER'@'localhost';"
    mysql -u root -p$MYSQL_ROOT_PASSWORD -e "FLUSH PRIVILEGES;"
    
    log_success "MySQL安装完成"
    log_info "MySQL root密码: $MYSQL_ROOT_PASSWORD"
    log_info "MySQL应用用户: $MYSQL_USER"
    log_info "MySQL应用密码: $MYSQL_PASSWORD"
}

# 安装Nginx
install_nginx() {
    log_info "安装Nginx..."
    
    apt install -y nginx
    
    # 启动并启用Nginx
    systemctl start nginx
    systemctl enable nginx
    
    # 配置防火墙
    ufw allow 'Nginx Full'
    ufw allow OpenSSH
    
    log_success "Nginx安装完成"
}

# 安装PM2
install_pm2() {
    log_info "安装PM2..."
    
    npm install -g pm2
    
    # 配置PM2开机自启
    pm2 startup
    
    log_success "PM2安装完成"
}

# 创建应用用户
create_app_user() {
    log_info "创建应用用户..."
    
    # 创建系统用户
    useradd -r -s /bin/bash -d $APP_DIR $SERVICE_USER
    
    # 创建应用目录
    mkdir -p $APP_DIR
    chown -R $SERVICE_USER:$SERVICE_USER $APP_DIR
    
    log_success "应用用户创建完成"
}

# 部署应用
deploy_app() {
    log_info "部署应用..."
    
    # 切换到应用用户
    sudo -u $SERVICE_USER bash << EOF
cd $APP_DIR

# 克隆GitHub仓库
log_info "克隆GitHub仓库..."
git clone $GITHUB_REPO .

# 安装依赖
log_info "安装项目依赖..."
pnpm install --production

# 创建环境变量文件
log_info "创建环境变量文件..."
cat > .env.local << 'ENVEOF'
$ENV_CONTENT
ENVEOF

# 构建应用
log_info "构建应用..."
pnpm run build

EOF
    
    log_success "应用部署完成"
}

# 配置数据库
setup_database() {
    log_info "初始化数据库..."
    
    # 使用应用用户执行数据库初始化
    sudo -u $SERVICE_USER bash << EOF
cd $APP_DIR

# 执行数据库初始化脚本
mysql -h localhost -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < init-database.sql

# 执行数据库更新脚本（如果存在）
if [ -f "scripts/update-database-schema.sql" ]; then
    mysql -h localhost -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE < scripts/update-database-schema.sql
fi

EOF
    
    log_success "数据库初始化完成"
}

# 配置PM2
setup_pm2() {
    log_info "配置PM2..."
    
    # 创建PM2配置文件
    sudo -u $SERVICE_USER bash << EOF
cd $APP_DIR

# 创建PM2生态系统文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    error_file: '/var/log/pm2/$APP_NAME-error.log',
    out_file: '/var/log/pm2/$APP_NAME-out.log',
    log_file: '/var/log/pm2/$APP_NAME.log',
    time: true
  }]
};
EOF

    # 启动应用
    pm2 start ecosystem.config.js
    pm2 save
    
EOF
    
    log_success "PM2配置完成"
}

# 配置Nginx
setup_nginx() {
    log_info "配置Nginx..."
    
    # 创建Nginx配置文件
    cat > /etc/nginx/sites-available/$APP_NAME << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # 限制请求大小
    client_max_body_size 10M;
    
    # 静态文件缓存
    location /_next/static/ {
        alias $APP_DIR/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 上传文件
    location /uploads/ {
        alias $APP_DIR/public/uploads/;
        expires 1M;
        add_header Cache-Control "public";
    }
    
    # 代理到Node.js应用
    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF
    
    # 启用站点
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # 删除默认站点
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试Nginx配置
    nginx -t
    
    # 重载Nginx
    systemctl reload nginx
    
    log_success "Nginx配置完成"
}

# 安装SSL证书
install_ssl() {
    log_info "安装SSL证书..."
    
    # 安装Certbot
    apt install -y certbot python3-certbot-nginx
    
    # 获取SSL证书
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL
    
    # 设置自动续期
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    log_success "SSL证书安装完成"
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    # 重置UFW
    ufw --force reset
    
    # 设置默认策略
    ufw default deny incoming
    ufw default allow outgoing
    
    # 允许SSH
    ufw allow ssh
    ufw allow 22/tcp
    
    # 允许HTTP和HTTPS
    ufw allow 'Nginx Full'
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # 启用防火墙
    ufw --force enable
    
    log_success "防火墙配置完成"
}

# 配置SSH安全
setup_ssh_security() {
    log_info "配置SSH安全..."
    
    # 备份SSH配置
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
    
    # 修改SSH配置
    cat > /etc/ssh/sshd_config << EOF
# SSH安全配置
Port 22
Protocol 2
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PermitEmptyPasswords no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
EOF
    
    # 重启SSH服务
    systemctl restart sshd
    
    log_success "SSH安全配置完成"
}

# 创建日志目录
setup_logging() {
    log_info "设置日志..."
    
    # 创建PM2日志目录
    mkdir -p /var/log/pm2
    chown -R $SERVICE_USER:$SERVICE_USER /var/log/pm2
    
    # 配置日志轮转
    cat > /etc/logrotate.d/$APP_NAME << EOF
/var/log/pm2/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $SERVICE_USER $SERVICE_USER
    postrotate
        /usr/bin/pm2 reloadLogs
    endscript
}
EOF
    
    log_success "日志配置完成"
}

# 创建备份脚本
create_backup_script() {
    log_info "创建备份脚本..."
    
    cat > /opt/backup-$APP_NAME.sh << EOF
#!/bin/bash
# 自动备份脚本

BACKUP_DIR="/opt/backups"
DATE=\$(date +%Y%m%d_%H%M%S)
APP_DIR="$APP_DIR"

# 创建备份目录
mkdir -p \$BACKUP_DIR

# 备份数据库
mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > \$BACKUP_DIR/database_\$DATE.sql

# 备份应用文件
tar -czf \$BACKUP_DIR/app_\$DATE.tar.gz -C \$(dirname \$APP_DIR) \$(basename \$APP_DIR)

# 删除7天前的备份
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: \$DATE"
EOF
    
    chmod +x /opt/backup-$APP_NAME.sh
    
    # 添加到crontab，每天凌晨2点备份
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-$APP_NAME.sh") | crontab -
    
    log_success "备份脚本创建完成"
}

# 创建监控脚本
create_monitor_script() {
    log_info "创建监控脚本..."
    
    cat > /opt/monitor-$APP_NAME.sh << EOF
#!/bin/bash
# 应用监控脚本

APP_NAME="$APP_NAME"
LOG_FILE="/var/log/monitor-\$APP_NAME.log"

# 检查应用状态
if ! pm2 list | grep -q "\$APP_NAME.*online"; then
    echo "\$(date): 应用未运行，尝试重启..." >> \$LOG_FILE
    pm2 restart \$APP_NAME
fi

# 检查Nginx状态
if ! systemctl is-active --quiet nginx; then
    echo "\$(date): Nginx未运行，尝试重启..." >> \$LOG_FILE
    systemctl restart nginx
fi

# 检查MySQL状态
if ! systemctl is-active --quiet mysql; then
    echo "\$(date): MySQL未运行，尝试重启..." >> \$LOG_FILE
    systemctl restart mysql
fi
EOF
    
    chmod +x /opt/monitor-$APP_NAME.sh
    
    # 添加到crontab，每5分钟检查一次
    (crontab -l 2>/dev/null; echo "*/5 * * * * /opt/monitor-$APP_NAME.sh") | crontab -
    
    log_success "监控脚本创建完成"
}

# 显示部署信息
show_deployment_info() {
    log_success "🎉 部署完成！"
    echo ""
    echo "=========================================="
    echo "部署信息:"
    echo "=========================================="
    echo "应用目录: $APP_DIR"
    echo "应用用户: $SERVICE_USER"
    echo "访问地址: https://$DOMAIN"
    echo "管理地址: https://$DOMAIN/admin"
    echo "工作台地址: https://$DOMAIN/dashboard"
    echo ""
    echo "数据库信息:"
    echo "MySQL Root密码: $MYSQL_ROOT_PASSWORD"
    echo "MySQL用户: $MYSQL_USER"
    echo "MySQL密码: $MYSQL_PASSWORD"
    echo "数据库名: $MYSQL_DATABASE"
    echo ""
    echo "服务器信息:"
    echo "IP地址: $(curl -s ifconfig.me)"
    echo "SSH端口: 22"
    echo "SSH用户: root"
    echo ""
    echo "管理命令:"
    echo "查看应用状态: pm2 status"
    echo "查看应用日志: pm2 logs $APP_NAME"
    echo "重启应用: pm2 restart $APP_NAME"
    echo "查看Nginx状态: systemctl status nginx"
    echo "查看MySQL状态: systemctl status mysql"
    echo "=========================================="
    
    # 保存重要信息到文件
    cat > /root/deployment-info.txt << EOF
京世盈风水收款系统 - 部署信息
====================================
部署时间: $(date)
应用目录: $APP_DIR
应用用户: $SERVICE_USER
访问地址: https://$DOMAIN

数据库信息:
MySQL Root密码: $MYSQL_ROOT_PASSWORD
MySQL用户: $MYSQL_USER
MySQL密码: $MYSQL_PASSWORD
数据库名: $MYSQL_DATABASE

服务器信息:
IP地址: $(curl -s ifconfig.me)
SSH端口: 22
SSH用户: root

管理命令:
pm2 status                    # 查看应用状态
pm2 logs $APP_NAME           # 查看应用日志
pm2 restart $APP_NAME        # 重启应用
systemctl status nginx       # 查看Nginx状态
systemctl status mysql       # 查看MySQL状态

备份脚本: /opt/backup-$APP_NAME.sh
监控脚本: /opt/monitor-$APP_NAME.sh
====================================
EOF
    
    log_info "部署信息已保存到: /root/deployment-info.txt"
}

# 主函数
main() {
    log_info "开始部署京世盈风水收款系统..."
    
    check_root
    update_system
    install_nodejs
    install_mysql
    install_nginx
    install_pm2
    create_app_user
    deploy_app
    setup_database
    setup_pm2
    setup_nginx
    install_ssl
    setup_firewall
    setup_ssh_security
    setup_logging
    create_backup_script
    create_monitor_script
    show_deployment_info
    
    log_success "部署脚本执行完成！"
}

# 执行主函数
main "$@"
