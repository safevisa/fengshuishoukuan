#!/bin/bash

# 京世盈风水收款系统 - 快速部署脚本
# 适用于Vultr Ubuntu服务器的一键部署

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

# 交互式配置
echo "==========================================="
echo "京世盈风水收款系统 - Vultr快速部署"
echo "==========================================="
echo ""

# 获取用户输入
read -p "请输入您的域名 (例如: jinshiying.com): " DOMAIN
read -p "请输入您的邮箱 (用于SSL证书): " EMAIL
read -p "请输入应用端口 (默认3000): " PORT
PORT=${PORT:-3000}

# 确认配置
echo ""
echo "配置确认:"
echo "域名: $DOMAIN"
echo "邮箱: $EMAIL"
echo "端口: $PORT"
echo ""
read -p "确认开始部署? (y/N): " CONFIRM

if [[ $CONFIRM != [yY] ]]; then
    log_info "部署已取消"
    exit 0
fi

# 下载并执行完整部署脚本
log_info "下载部署脚本..."
curl -fsSL https://raw.githubusercontent.com/safevisa/fengshuishoukuan/main/scripts/deploy-vultr.sh -o /tmp/deploy-vultr.sh

# 替换配置变量
sed -i "s/DOMAIN=\"jinshiying.com\"/DOMAIN=\"$DOMAIN\"/g" /tmp/deploy-vultr.sh
sed -i "s/EMAIL=\"admin@jinshiying.com\"/EMAIL=\"$EMAIL\"/g" /tmp/deploy-vultr.sh
sed -i "s/PORT=3000/PORT=$PORT/g" /tmp/deploy-vultr.sh

# 执行部署脚本
log_info "开始执行部署..."
chmod +x /tmp/deploy-vultr.sh
/tmp/deploy-vultr.sh

log_success "快速部署完成！"
