#!/bin/bash

# 生产环境问题检查脚本
# 用于检查用户登录后收款链接无法显示的问题

echo "🔍 开始检查生产环境问题..."
echo "=================================="

# 1. 检查MySQL数据库连接
echo "1. 检查MySQL数据库连接..."
echo "----------------------------------"

# 检查环境变量
echo "📋 检查数据库环境变量:"
echo "DB_HOST: ${DB_HOST:-'未设置'}"
echo "DB_USER: ${DB_USER:-'未设置'}"
echo "DB_NAME: ${DB_NAME:-'未设置'}"
echo "DB_PORT: ${DB_PORT:-'未设置'}"

# 测试MySQL连接
echo ""
echo "🔌 测试MySQL连接:"
if command -v mysql &> /dev/null; then
    mysql -h${DB_HOST:-localhost} -u${DB_USER:-root} -p${DB_PASSWORD:-} -e "SELECT 1;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ MySQL连接成功"
    else
        echo "❌ MySQL连接失败"
    fi
else
    echo "⚠️  mysql客户端未安装"
fi

# 2. 检查数据库表结构
echo ""
echo "2. 检查数据库表结构..."
echo "----------------------------------"

if command -v mysql &> /dev/null; then
    echo "📊 检查payment_links表结构:"
    mysql -h${DB_HOST:-localhost} -u${DB_USER:-root} -p${DB_PASSWORD:-} -e "DESCRIBE payment_links;" 2>/dev/null
    
    echo ""
    echo "📊 检查users表结构:"
    mysql -h${DB_HOST:-localhost} -u${DB_USER:-root} -p${DB_PASSWORD:-} -e "DESCRIBE users;" 2>/dev/null
    
    echo ""
    echo "📊 检查payment_links表数据:"
    mysql -h${DB_HOST:-localhost} -u${DB_USER:-root} -p${DB_PASSWORD:-} -e "SELECT id, user_id, amount, description, status, created_at FROM payment_links ORDER BY created_at DESC LIMIT 5;" 2>/dev/null
    
    echo ""
    echo "📊 检查users表数据:"
    mysql -h${DB_HOST:-localhost} -u${DB_USER:-root} -p${DB_PASSWORD:-} -e "SELECT id, email, name, role, status FROM users ORDER BY created_at DESC LIMIT 5;" 2>/dev/null
fi

# 3. 检查应用代码
echo ""
echo "3. 检查应用代码..."
echo "----------------------------------"

# 检查关键文件是否存在
echo "📁 检查关键文件:"
files=(
    "lib/mysql-database.ts"
    "lib/database.ts"
    "app/api/auth/login/route.ts"
    "app/api/payment-links/route.ts"
    "app/auth/login/page.tsx"
    "app/dashboard/page.tsx"
    "components/user-guard.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file 存在"
    else
        echo "❌ $file 不存在"
    fi
done

# 4. 检查代码内容
echo ""
echo "4. 检查代码内容..."
echo "----------------------------------"

# 检查mysql-database.ts中的getConnection导入
echo "🔍 检查mysql-database.ts中的getConnection导入:"
if grep -q "import { getConnection }" lib/mysql-database.ts 2>/dev/null; then
    echo "✅ getConnection导入存在"
else
    echo "❌ getConnection导入缺失"
fi

# 检查database.ts中的getConnection函数
echo ""
echo "🔍 检查database.ts中的getConnection函数:"
if grep -q "export async function getConnection" lib/database.ts 2>/dev/null; then
    echo "✅ getConnection函数存在"
else
    echo "❌ getConnection函数缺失"
fi

# 检查登录API是否使用mysqlDB
echo ""
echo "🔍 检查登录API是否使用mysqlDB:"
if grep -q "import { mysqlDB }" app/api/auth/login/route.ts 2>/dev/null; then
    echo "✅ 登录API使用mysqlDB"
else
    echo "❌ 登录API未使用mysqlDB"
fi

# 检查支付链接API是否使用mysqlDB
echo ""
echo "🔍 检查支付链接API是否使用mysqlDB:"
if grep -q "import { mysqlDB }" app/api/payment-links/route.ts 2>/dev/null; then
    echo "✅ 支付链接API使用mysqlDB"
else
    echo "❌ 支付链接API未使用mysqlDB"
fi

# 检查字段映射
echo ""
echo "🔍 检查字段映射:"
if grep -q "userId: row.user_id" lib/mysql-database.ts 2>/dev/null; then
    echo "✅ 字段映射存在 (user_id -> userId)"
else
    echo "❌ 字段映射缺失"
fi

# 5. 检查应用服务状态
echo ""
echo "5. 检查应用服务状态..."
echo "----------------------------------"

# 检查应用是否运行
echo "🔍 检查应用进程:"
if pgrep -f "next-server" > /dev/null; then
    echo "✅ Next.js应用正在运行"
    echo "进程信息:"
    ps aux | grep "next-server" | grep -v grep
else
    echo "❌ Next.js应用未运行"
fi

# 检查端口占用
echo ""
echo "🔍 检查端口占用:"
if netstat -tlnp 2>/dev/null | grep -q ":3000"; then
    echo "✅ 端口3000被占用"
    netstat -tlnp 2>/dev/null | grep ":3000"
else
    echo "❌ 端口3000未被占用"
fi

# 6. 检查API端点
echo ""
echo "6. 检查API端点..."
echo "----------------------------------"

# 检查API端点是否可访问
base_url="http://localhost:3000"

echo "🔍 检查API端点可访问性:"

# 检查登录API
if curl -s -o /dev/null -w "%{http_code}" "$base_url/api/auth/login" | grep -q "405\|400"; then
    echo "✅ /api/auth/login 端点可访问"
else
    echo "❌ /api/auth/login 端点不可访问"
fi

# 检查支付链接API
if curl -s -o /dev/null -w "%{http_code}" "$base_url/api/payment-links" | grep -q "400"; then
    echo "✅ /api/payment-links 端点可访问"
else
    echo "❌ /api/payment-links 端点不可访问"
fi

# 7. 检查环境配置
echo ""
echo "7. 检查环境配置..."
echo "----------------------------------"

# 检查.env.production文件
if [ -f ".env.production" ]; then
    echo "✅ .env.production 文件存在"
    echo "📋 环境变量内容:"
    grep -E "^(DB_|NODE_ENV)" .env.production 2>/dev/null | sed 's/=.*/=***/' # 隐藏敏感信息
else
    echo "❌ .env.production 文件不存在"
fi

# 8. 生成诊断报告
echo ""
echo "8. 生成诊断报告..."
echo "=================================="

# 创建诊断报告文件
report_file="production-diagnosis-$(date +%Y%m%d-%H%M%S).txt"
echo "📝 生成诊断报告: $report_file"

{
    echo "生产环境诊断报告"
    echo "生成时间: $(date)"
    echo "=================================="
    echo ""
    
    echo "1. 系统信息:"
    echo "操作系统: $(uname -a)"
    echo "Node.js版本: $(node --version 2>/dev/null || echo '未安装')"
    echo "npm版本: $(npm --version 2>/dev/null || echo '未安装')"
    echo ""
    
    echo "2. 数据库连接测试:"
    if command -v mysql &> /dev/null; then
        mysql -h${DB_HOST:-localhost} -u${DB_USER:-root} -p${DB_PASSWORD:-} -e "SELECT 'MySQL连接成功' as status;" 2>/dev/null || echo "MySQL连接失败"
    else
        echo "mysql客户端未安装"
    fi
    echo ""
    
    echo "3. 应用状态:"
    echo "Next.js进程: $(pgrep -f 'next-server' | wc -l) 个"
    echo "端口3000状态: $(netstat -tlnp 2>/dev/null | grep ':3000' | wc -l) 个连接"
    echo ""
    
    echo "4. 关键文件检查:"
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            echo "✅ $file"
        else
            echo "❌ $file"
        fi
    done
    echo ""
    
    echo "5. 代码检查结果:"
    echo "getConnection函数: $(grep -q 'export async function getConnection' lib/database.ts && echo '存在' || echo '缺失')"
    echo "mysqlDB导入: $(grep -q 'import { mysqlDB }' app/api/auth/login/route.ts && echo '存在' || echo '缺失')"
    echo "字段映射: $(grep -q 'userId: row.user_id' lib/mysql-database.ts && echo '存在' || echo '缺失')"
    
} > "$report_file"

echo "✅ 诊断报告已生成: $report_file"

# 9. 提供修复建议
echo ""
echo "9. 修复建议..."
echo "=================================="

echo "🔧 如果发现问题，请执行以下修复步骤:"
echo ""
echo "1. 如果MySQL连接失败:"
echo "   - 检查数据库服务是否运行: systemctl status mysql"
echo "   - 检查环境变量配置"
echo "   - 验证数据库用户权限"
echo ""
echo "2. 如果代码文件缺失:"
echo "   - 从GitHub拉取最新代码: git pull origin main"
echo "   - 重新构建应用: pnpm run build"
echo "   - 重启服务: systemctl restart fengshui-app"
echo ""
echo "3. 如果字段映射问题:"
echo "   - 检查lib/mysql-database.ts中的字段转换"
echo "   - 确保数据库表结构与代码一致"
echo ""
echo "4. 如果API端点不可访问:"
echo "   - 检查应用是否正常启动"
echo "   - 查看应用日志: journalctl -u fengshui-app -f"
echo "   - 检查nginx配置"
echo ""

echo "🎯 检查完成！请查看诊断报告获取详细信息。"
