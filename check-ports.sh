#!/bin/bash

# 端口检查脚本

echo "🔍 检查端口使用情况..."

# 1. 检查所有监听的端口
echo "📡 所有监听的端口:"
ss -tlnp | grep LISTEN

echo ""
echo "🎯 重点检查端口:"

# 2. 检查3000端口
echo "🔍 端口3000:"
ss -tlnp | grep :3000 || echo "❌ 端口3000未被占用"

# 3. 检查80端口
echo "🔍 端口80:"
ss -tlnp | grep :80 || echo "❌ 端口80未被占用"

# 4. 检查443端口
echo "🔍 端口443:"
ss -tlnp | grep :443 || echo "❌ 端口443未被占用"

# 5. 检查所有Node.js进程
echo "📱 Node.js进程:"
ps aux | grep node | grep -v grep || echo "❌ 没有Node.js进程"

# 6. 检查所有Docker容器
echo "🐳 Docker容器:"
docker ps 2>/dev/null || echo "❌ Docker未运行或未安装"

# 7. 检查Nginx进程
echo "⚙️ Nginx进程:"
ps aux | grep nginx | grep -v grep || echo "❌ 没有Nginx进程"

# 8. 检查端口范围使用情况
echo "📊 端口使用统计:"
echo "3000-3010端口:"
ss -tlnp | grep -E ':300[0-9]' || echo "❌ 3000-3009端口都未被占用"

echo "80-90端口:"
ss -tlnp | grep -E ':(8[0-9]|90)' || echo "❌ 80-90端口都未被占用"

echo "440-450端口:"
ss -tlnp | grep -E ':(44[0-9]|450)' || echo "❌ 440-450端口都未被占用"

# 9. 检查系统服务
echo "🔧 相关系统服务:"
systemctl status nginx --no-pager -l 2>/dev/null | head -5 || echo "❌ Nginx服务未运行"
systemctl status docker --no-pager -l 2>/dev/null | head -5 || echo "❌ Docker服务未运行"

echo ""
echo "🎯 端口检查完成！"
