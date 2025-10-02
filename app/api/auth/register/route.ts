import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

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

    // 创建新用户
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      password, // 注意：生产环境应该加密密码
      phone: phone || '',
      role,
      userType: 'self_registered',
      status: 'active',
      balance: 0,
      totalEarnings: 0,
      totalWithdrawals: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 保存用户
    await mysqlDB.addUser(newUser);

    return NextResponse.json({
      success: true,
      message: '註冊成功！歡迎加入京世盈風水！'
    });
  } catch (error) {
    console.error('User registration error:', error);
    return NextResponse.json({
      success: false,
      message: '用户创建失败，请重试'
    }, { status: 500 });
  }
}