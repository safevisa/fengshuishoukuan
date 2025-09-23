#!/bin/bash

echo "🔧 修复生产环境API问题..."

# 进入应用目录
cd /opt/fengshui-ecommerce/fengshui-ecommerce

# 停止应用
echo "⏹️ 停止应用..."
systemctl stop fengshui-app

# 解决Git冲突
echo "🔄 解决Git冲突..."
git stash
git pull origin main

# 确保API目录存在
echo "📁 创建API目录..."
mkdir -p app/api/auth
mkdir -p app/api/users
mkdir -p app/api/orders
mkdir -p app/api/payments
mkdir -p app/api/withdrawals
mkdir -p app/api/financial-report

# 创建用户API
echo "👤 创建用户API..."
cat > app/api/users/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function GET(request: NextRequest) {
  try {
    const users = await productionDB.getAllUsers();
    console.log('API: Getting users, count:', users.length);
    return NextResponse.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({
      success: false,
      message: '获取用户列表失败',
      users: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role = 'user' } = body;

    console.log('API: Creating user:', { name, email, role });

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: '姓名、邮箱和密码不能为空'
      }, { status: 400 });
    }

    const existingUser = await productionDB.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: '邮箱已被占用'
      }, { status: 400 });
    }

    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      phone: phone || '',
      password,
      role,
      userType: 'admin_created',
      status: 'active',
      balance: 0,
      createdAt: new Date()
    };

    await productionDB.addUser(newUser);
    console.log('API: User created successfully:', newUser.id);

    return NextResponse.json({
      success: true,
      message: '用户创建成功',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        userType: newUser.userType,
        status: newUser.status,
        balance: newUser.balance,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({
      success: false,
      message: '用户创建失败，请重试'
    }, { status: 500 });
  }
}
EOF

# 创建登录API
echo "🔐 创建登录API..."
cat > app/api/auth/login/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('API: Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: '邮箱和密码不能为空'
      }, { status: 400 });
    }

    const user = await productionDB.getUserByEmail(email);
    if (!user) {
      console.log('API: User not found:', email);
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 401 });
    }

    if (user.password !== password) {
      console.log('API: Password mismatch for:', email);
      return NextResponse.json({
        success: false,
        message: '密码错误'
      }, { status: 401 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({
        success: false,
        message: '账户已被禁用'
      }, { status: 401 });
    }

    console.log('API: Login successful for:', email);
    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    return NextResponse.json({
      success: false,
      message: '登录失败，请重试'
    }, { status: 500 });
  }
}
EOF

# 创建其他API文件
echo "📊 创建其他API文件..."

cat > app/api/orders/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function GET(request: NextRequest) {
  try {
    const orders = await productionDB.getAllOrders();
    return NextResponse.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({
      success: false,
      message: '获取订单列表失败',
      orders: []
    }, { status: 500 });
  }
}
EOF

cat > app/api/payments/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function GET(request: NextRequest) {
  try {
    const payments = await productionDB.getAllPayments();
    return NextResponse.json({
      success: true,
      payments: payments
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json({
      success: false,
      message: '获取支付记录失败',
      payments: []
    }, { status: 500 });
  }
}
EOF

cat > app/api/withdrawals/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function GET(request: NextRequest) {
  try {
    const withdrawals = await productionDB.getAllWithdrawals();
    return NextResponse.json({
      success: true,
      withdrawals: withdrawals
    });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json({
      success: false,
      message: '获取提现记录失败',
      withdrawals: []
    }, { status: 500 });
  }
}
EOF

cat > app/api/financial-report/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function GET(request: NextRequest) {
  try {
    const financialReport = await productionDB.generateFinancialReport();
    return NextResponse.json({
      success: true,
      ...financialReport
    });
  } catch (error) {
    console.error('Get financial report error:', error);
    return NextResponse.json({
      success: false,
      message: '获取财务报告失败',
      totalRevenue: 0,
      totalOrders: 0,
      platformFee: 0,
      netProfit: 0
    }, { status: 500 });
  }
}
EOF

# 初始化数据
echo "💾 初始化数据..."
node init-data.js

# 重新构建应用
echo "🏗️ 重新构建应用..."
pnpm run build

# 启动应用
echo "🚀 启动应用..."
systemctl start fengshui-app

# 等待应用启动
sleep 5

# 检查状态
echo "📊 检查应用状态..."
systemctl status fengshui-app --no-pager

# 测试API
echo "🧪 测试API..."
echo "测试用户API:"
curl -s http://localhost:3000/api/users | head -c 200
echo ""
echo "测试登录API:"
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jinshiying.com","password":"admin123"}' | head -c 200
echo ""

echo "✅ 修复完成！"
echo "📝 请测试以下功能："
echo "1. 访问 https://jinshiying.com/admin"
echo "2. 创建新用户"
echo "3. 使用创建的账号登录 https://jinshiying.com/auth/login"
