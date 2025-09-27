#!/bin/bash

# 修复端口冲突脚本

echo "🔧 修复端口冲突..."

# 1. 查找占用3000端口的进程
echo "🔍 查找占用3000端口的进程:"
PORT_PID=$(ss -tlnp | grep :3000 | grep -o 'pid=[0-9]*' | cut -d= -f2)
echo "占用3000端口的进程ID: $PORT_PID"

if [ ! -z "$PORT_PID" ]; then
    echo "📱 进程详情:"
    ps -p $PORT_PID -o pid,ppid,cmd 2>/dev/null || echo "❌ 进程不存在"
    
    echo "🛑 终止占用端口的进程..."
    kill -TERM $PORT_PID 2>/dev/null
    sleep 3
    
    # 检查进程是否还在运行
    if ps -p $PORT_PID > /dev/null 2>&1; then
        echo "⚠️ 进程仍在运行，强制终止..."
        kill -KILL $PORT_PID 2>/dev/null
        sleep 2
    fi
    
    echo "✅ 进程已终止"
else
    echo "❌ 未找到占用3000端口的进程"
fi

# 2. 再次检查端口状态
echo "🔍 检查端口状态:"
ss -tlnp | grep :3000 || echo "✅ 端口3000已释放"

# 3. 清理所有Node.js进程
echo "🧹 清理所有Node.js进程..."
pkill -f "next-server" 2>/dev/null || echo "没有next-server进程"
pkill -f "node.*next" 2>/dev/null || echo "没有next相关进程"
sleep 2

# 4. 检查是否还有Node.js进程
echo "📱 检查剩余Node.js进程:"
ps aux | grep node | grep -v grep || echo "✅ 没有Node.js进程"

# 5. 检查端口是否完全释放
echo "🔍 最终端口检查:"
ss -tlnp | grep :3000 || echo "✅ 端口3000完全释放"

echo ""
echo "🎯 端口冲突修复完成！"
echo "现在可以重新启动应用了"


