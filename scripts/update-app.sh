#!/bin/bash

# 京世盈风水收款系统 - 应用更新脚本
# 用于从GitHub仓库更新应用代码

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 配置变量
APP_NAME="fengshui-ecommerce"
APP_DIR="/opt/$APP_NAME"
SERVICE_USER="fengshui"
BACKUP_DIR="/opt/backups"

# 检查是否为root用户
if [[ $EUID -ne 0 ]]; then
    log_error "此脚本需要root权限运行"
    log_info "请使用: sudo $0"
    exit 1
fi

# 创建备份
create_backup() {
    log_info "创建应用备份..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz"
    
    mkdir -p $BACKUP_DIR
    
    # 备份应用目录
    tar -czf $BACKUP_FILE -C $(dirname $APP_DIR) $(basename $APP_DIR)
    
    log_success "备份完成: $BACKUP_FILE"
}

# 更新代码
update_code() {
    log_info "更新应用代码..."
    
    # 切换到应用用户
    sudo -u $SERVICE_USER bash << EOF
cd $APP_DIR

# 停止应用
pm2 stop $APP_NAME

# 拉取最新代码
git fetch origin
git reset --hard origin/main

# 安装依赖
pnpm install --production

# 构建应用
pnpm run build

EOF
    
    log_success "代码更新完成"
}

# 更新数据库
update_database() {
    log_info "检查数据库更新..."
    
    # 检查是否有数据库更新脚本
    if [ -f "$APP_DIR/scripts/update-database-schema.sql" ]; then
        log_info "执行数据库更新..."
        
        # 备份数据库
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        mysqldump -u fengshui_user -p$(grep MYSQL_PASSWORD $APP_DIR/.env.local | cut -d'=' -f2) fengshui_ecommerce > $BACKUP_DIR/database_backup_$TIMESTAMP.sql
        
        # 执行数据库更新
        mysql -u fengshui_user -p$(grep MYSQL_PASSWORD $APP_DIR/.env.local | cut -d'=' -f2) fengshui_ecommerce < $APP_DIR/scripts/update-database-schema.sql
        
        log_success "数据库更新完成"
    else
        log_info "无需数据库更新"
    fi
}

# 重启应用
restart_app() {
    log_info "重启应用..."
    
    sudo -u $SERVICE_USER bash << EOF
cd $APP_DIR

# 重启应用
pm2 restart $APP_NAME

# 等待应用启动
sleep 5

# 检查应用状态
if pm2 list | grep -q "$APP_NAME.*online"; then
    echo "应用启动成功"
else
    echo "应用启动失败，请检查日志"
    pm2 logs $APP_NAME --lines 50
    exit 1
fi

EOF
    
    log_success "应用重启完成"
}

# 清理旧备份
cleanup_backups() {
    log_info "清理旧备份..."
    
    # 删除7天前的备份
    find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
    find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
    
    log_success "备份清理完成"
}

# 显示更新信息
show_update_info() {
    log_success "🎉 应用更新完成！"
    echo ""
    echo "更新信息:"
    echo "更新时间: $(date)"
    echo "应用状态: $(pm2 list | grep $APP_NAME | awk '{print $10}')"
    echo "应用目录: $APP_DIR"
    echo ""
    echo "管理命令:"
    echo "查看应用状态: pm2 status"
    echo "查看应用日志: pm2 logs $APP_NAME"
    echo "重启应用: pm2 restart $APP_NAME"
    echo "=========================================="
}

# 主函数
main() {
    log_info "开始更新京世盈风水收款系统..."
    
    create_backup
    update_code
    update_database
    restart_app
    cleanup_backups
    show_update_info
    
    log_success "更新脚本执行完成！"
}

# 执行主函数
main "$@"
