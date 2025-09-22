import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    // 验证输入
    if (!email || !password || !name || !phone) {
      return NextResponse.json({
        success: false,
        message: '请填写所有必需字段'
      }, { status: 400 });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: '请输入有效的邮箱地址'
      }, { status: 400 });
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: '密码至少需要6位字符'
      }, { status: 400 });
    }

    // 检查用户是否已存在
    const existingUser = await productionDB.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: '此邮箱已被注册'
      }, { status: 409 });
    }

    // 创建新用户
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      password,
      role: 'user' as const,
      userType: 'registered' as const,
      status: 'active' as const,
      balance: 0,
      createdAt: new Date()
    };

    await productionDB.addUser(newUser);

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      message: '注册成功！欢迎加入京世盈风水！',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      message: '注册失败，请重试'
    }, { status: 500 });
  }
}
