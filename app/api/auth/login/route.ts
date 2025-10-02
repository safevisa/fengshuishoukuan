import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: '電子郵件和密碼不能為空'
      }, { status: 400 });
    }

    // 查找用户
    const user = await mysqlDB.getUserByEmail(email);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '電子郵件或密碼錯誤，請重試'
      }, { status: 401 });
    }

    // 验证密码（注意：生产环境应该使用加密密码比较）
    if (user.password !== password) {
      return NextResponse.json({
        success: false,
        message: '電子郵件或密碼錯誤，請重試'
      }, { status: 401 });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return NextResponse.json({
        success: false,
        message: '帳戶已被暫停，請聯繫管理員'
      }, { status: 401 });
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      success: true,
      message: '登入成功！歡迎回來！',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('User login error:', error);
    return NextResponse.json({
      success: false,
      message: '登录失败，请重试'
    }, { status: 500 });
  }
}