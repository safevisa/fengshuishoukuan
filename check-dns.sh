#!/bin/bash

# DNS解析检查脚本
# 使用方法: ./check-dns.sh yourdomain.com

set -e

DOMAIN=$1
if [ -z "$DOMAIN" ]; then
    echo "使用方法: ./check-dns.sh yourdomain.com"
    exit 1
fi

echo "🔍 检查域名 $DOMAIN 的DNS解析..."

# 获取服务器公网IP
echo "📡 获取服务器公网IP..."
SERVER_IP=$(curl -s ifconfig.me || curl -s ipinfo.io/ip || curl -s icanhazip.com)
echo "服务器IP: $SERVER_IP"

# 检查A记录
echo ""
echo "🌐 检查A记录解析..."
echo "主域名 ($DOMAIN):"
nslookup $DOMAIN | grep -A 1 "Name:" || echo "未找到A记录"

echo ""
echo "www子域名 (www.$DOMAIN):"
nslookup www.$DOMAIN | grep -A 1 "Name:" || echo "未找到www A记录"

# 检查CNAME记录
echo ""
echo "🔗 检查CNAME记录..."
dig +short $DOMAIN CNAME 2>/dev/null || echo "无CNAME记录"
dig +short www.$DOMAIN CNAME 2>/dev/null || echo "无www CNAME记录"

# 检查MX记录
echo ""
echo "📧 检查MX记录..."
dig +short $DOMAIN MX 2>/dev/null || echo "无MX记录"

# 检查TXT记录
echo ""
echo "📝 检查TXT记录..."
dig +short $DOMAIN TXT 2>/dev/null || echo "无TXT记录"

# 检查解析是否正确
echo ""
echo "✅ 验证解析结果..."
DOMAIN_IP=$(dig +short $DOMAIN | head -1)
WWW_IP=$(dig +short www.$DOMAIN | head -1)

if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
    echo "✅ 主域名解析正确: $DOMAIN -> $DOMAIN_IP"
else
    echo "❌ 主域名解析错误: $DOMAIN -> $DOMAIN_IP (期望: $SERVER_IP)"
fi

if [ "$WWW_IP" = "$SERVER_IP" ]; then
    echo "✅ www子域名解析正确: www.$DOMAIN -> $WWW_IP"
else
    echo "❌ www子域名解析错误: www.$DOMAIN -> $WWW_IP (期望: $SERVER_IP)"
fi

# 检查域名是否可访问
echo ""
echo "🌐 检查域名可访问性..."
if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN | grep -q "200\|302"; then
    echo "✅ HTTP访问正常"
else
    echo "❌ HTTP访问失败"
fi

if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|302"; then
    echo "✅ HTTPS访问正常"
else
    echo "❌ HTTPS访问失败"
fi

# DNS配置建议
echo ""
echo "📋 DNS配置建议:"
echo "如果解析不正确，请在您的DNS管理面板中添加以下记录:"
echo ""
echo "记录类型: A"
echo "主机记录: @"
echo "记录值: $SERVER_IP"
echo "TTL: 600"
echo ""
echo "记录类型: A"
echo "主机记录: www"
echo "记录值: $SERVER_IP"
echo "TTL: 600"
echo ""
echo "或者使用CNAME记录:"
echo "记录类型: CNAME"
echo "主机记录: www"
echo "记录值: $DOMAIN"
echo "TTL: 600"


