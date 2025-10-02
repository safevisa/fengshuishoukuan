import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

// 获取所有用户
export async function GET(request: NextRequest) {
  try {
    const users = await mysqlDB.getAllUsers();
    
    // 移除密码字段
    const safeUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      userType: user.userType,
      status: user.status,
      balance: user.balance,
      createdAt: user.createdAt
    }));

    return NextResponse.json({
      success: true,
      users: safeUsers
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({
      success: false,
      message: '获取用户列表失败'
    }, { status: 500 });
  }
}

// 创建新用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role = 'user' } = body;

    // 验证输入
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: '姓名、邮箱和密码不能为空'
      }, { status: 400 });
    }

    // 检查邮箱是否已存在
    const existingUser = await mysqlDB.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: '此電子郵件已被註冊'
      }, { status: 400 });
    }

    // 创建新用户数据（不包含id, createdAt, updatedAt）
    const userData = {
      name,
      email,
      password,
      phone: phone || '',
      role,
      userType: role === 'merchant' ? 'dashboard_user' : 'admin_created',
      status: 'active' as const,
      balance: 0,
      totalEarnings: 0,
      totalWithdrawals: 0
    };

    // 保存用户
    const newUser = await mysqlDB.addUser(userData);

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

