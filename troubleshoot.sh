#!/bin/bash

# 故障排除脚本
# 使用方法: ./troubleshoot.sh yourdomain.com

set -e

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
    echo "使用方法: ./troubleshoot.sh yourdomain.com"
    exit 1
fi

echo "🔧 开始故障排除检查..."

# 1. 检查系统状态
echo ""
echo "📊 系统状态检查:"
echo "内存使用:"
free -h

echo ""
echo "磁盘使用:"
df -h

echo ""
echo "CPU负载:"
uptime

# 2. 检查Docker状态
echo ""
echo "🐳 Docker状态检查:"
echo "Docker版本:"
docker --version

echo ""
echo "Docker容器状态:"
docker ps -a

echo ""
echo "Docker镜像:"
docker images

# 3. 检查Nginx状态
echo ""
echo "⚙️ Nginx状态检查:"
echo "Nginx版本:"
nginx -v 2>&1 || echo "Nginx未安装"

echo ""
echo "Nginx状态:"
sudo systemctl status nginx --no-pager || echo "Nginx未运行"

echo ""
echo "Nginx配置测试:"
sudo nginx -t || echo "Nginx配置有误"

# 4. 检查端口监听
echo ""
echo "🔌 端口监听检查:"
echo "监听端口:"
sudo ss -tlnp | grep -E ':(80|443|3000|22)'

# 5. 检查防火墙
echo ""
echo "🔥 防火墙状态:"
sudo ufw status || echo "UFW未启用"

# 6. 检查DNS解析
echo ""
echo "🌐 DNS解析检查:"
echo "主域名解析:"
nslookup $DOMAIN || echo "DNS解析失败"

echo ""
echo "www子域名解析:"
nslookup www.$DOMAIN || echo "www DNS解析失败"

# 7. 检查网络连接
echo ""
echo "🌍 网络连接检查:"
echo "外网连接测试:"
ping -c 3 8.8.8.8 || echo "外网连接失败"

echo ""
echo "域名连接测试:"
ping -c 3 $DOMAIN || echo "域名连接失败"

# 8. 检查SSL证书
echo ""
echo "🔐 SSL证书检查:"
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "SSL证书存在"
    echo "证书有效期:"
    openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -dates
else
    echo "SSL证书不存在"
fi

# 9. 检查应用日志
echo ""
echo "📝 应用日志检查:"
echo "Docker应用日志 (最后20行):"
docker-compose -f docker-compose.prod-fixed.yml logs --tail=20 app 2>/dev/null || echo "无法获取应用日志"

echo ""
echo "Nginx错误日志 (最后10行):"
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "无法获取Nginx错误日志"

# 10. 检查服务健康状态
echo ""
echo "🏥 服务健康检查:"
echo "HTTP健康检查:"
curl -s http://localhost/health || echo "HTTP健康检查失败"

echo ""
echo "应用健康检查:"
curl -s http://localhost:3000/health || echo "应用健康检查失败"

# 11. 提供修复建议
echo ""
echo "🔧 修复建议:"
echo ""

# 检查Docker容器是否运行
if ! docker ps | grep -q "baijian-app"; then
    echo "❌ Docker应用容器未运行"
    echo "   修复命令: docker-compose -f docker-compose.prod-fixed.yml up -d"
fi

# 检查Nginx是否运行
if ! sudo systemctl is-active --quiet nginx; then
    echo "❌ Nginx未运行"
    echo "   修复命令: sudo systemctl start nginx"
fi

# 检查端口是否监听
if ! sudo ss -tlnp | grep -q ":80 "; then
    echo "❌ 端口80未监听"
    echo "   修复命令: sudo systemctl restart nginx"
fi

if ! sudo ss -tlnp | grep -q ":3000 "; then
    echo "❌ 端口3000未监听"
    echo "   修复命令: docker-compose -f docker-compose.prod-fixed.yml up -d"
fi

# 检查DNS解析
DOMAIN_IP=$(dig +short $DOMAIN | head -1)
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")
if [ "$DOMAIN_IP" != "$SERVER_IP" ] && [ "$SERVER_IP" != "unknown" ]; then
    echo "❌ DNS解析不正确"
    echo "   当前解析: $DOMAIN -> $DOMAIN_IP"
    echo "   服务器IP: $SERVER_IP"
    echo "   请检查DNS配置"
fi

# 检查SSL证书
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "❌ SSL证书不存在"
    echo "   修复命令: sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN"
fi

echo ""
echo "✅ 故障排除检查完成"


