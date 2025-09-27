#!/bin/bash

# 检查部署状态脚本

echo "🔍 检查部署状态..."

# 1. 检查应用进程
echo "📱 应用进程状态:"
ps aux | grep node | grep -v grep || echo "❌ 没有Node.js进程运行"

# 2. 检查端口监听
echo "🌐 端口监听状态:"
ss -tlnp | grep -E ':(80|443|3000)' || echo "❌ 没有相关端口监听"

# 3. 检查应用日志
echo "📝 应用日志 (最后20行):"
if [ -f /root/baijian/app.log ]; then
    tail -20 /root/baijian/app.log
else
    echo "❌ 应用日志文件不存在"
fi

# 4. 检查Nginx状态
echo "⚙️ Nginx状态:"
systemctl status nginx --no-pager -l || echo "❌ Nginx未运行"

# 5. 检查systemd服务
echo "🔧 systemd服务状态:"
systemctl status fengshui-app --no-pager -l 2>/dev/null || echo "❌ fengshui-app服务未配置"

# 6. 测试HTTP连接
echo "🌐 HTTP连接测试:"
curl -I http://jinshiying.com 2>/dev/null | head -1 || echo "❌ HTTP连接失败"

# 7. 测试HTTPS连接
echo "🔒 HTTPS连接测试:"
curl -I https://jinshiying.com 2>/dev/null | head -1 || echo "❌ HTTPS连接失败"

# 8. 检查磁盘空间
echo "💾 磁盘空间:"
df -h / | tail -1

# 9. 检查内存使用
echo "🧠 内存使用:"
free -h

echo ""
echo "🎯 状态检查完成！"


