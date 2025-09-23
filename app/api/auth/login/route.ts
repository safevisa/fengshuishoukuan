import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: '邮箱和密码不能为空'
      }, { status: 400 });
    }

    // 查找用户
    const user = await productionDB.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '用户不存在'
      }, { status: 401 });
    }

    // 验证密码（注意：生产环境应该使用加密密码比较）
    if (user.password !== password) {
      return NextResponse.json({
        success: false,
        message: '密码错误'
      }, { status: 401 });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return NextResponse.json({
        success: false,
        message: '账户已被禁用'
      }, { status: 401 });
    }

    // 返回用户信息（不包含密码）
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