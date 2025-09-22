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
        message: '请提供邮箱和密码'
      }, { status: 400 });
    }

    // 从生产数据库查找用户
    const user = await productionDB.getUserByEmail(email);
    
    if (!user || user.password !== password) {
      return NextResponse.json({
        success: false,
        message: '邮箱或密码错误'
      }, { status: 401 });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return NextResponse.json({
        success: false,
        message: '账户已被暂停，请联系管理员'
      }, { status: 403 });
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: '登录失败，请重试'
    }, { status: 500 });
  }
}
