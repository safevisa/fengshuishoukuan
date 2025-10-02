import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 开始创建默认管理员账户...');
    
    // 检查是否已存在管理员
    const existingAdmin = await mysqlDB.getUserByEmail('admin@jinshiying.com');
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: '管理员账户已存在',
        data: {
          email: existingAdmin.email,
          name: existingAdmin.name
        }
      });
    }

    // 创建管理员用户
    const adminUser = {
      id: `admin_${Date.now()}`,
      name: '系统管理员',
      email: 'admin@jinshiying.com',
      password: 'admin123456', // 默认密码，生产环境请修改
      phone: '+852 61588111',
      role: 'admin',
      userType: 'admin_created',
      status: 'active',
      balance: 0,
      totalEarnings: 0,
      totalWithdrawals: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await mysqlDB.addUser(adminUser);
    
    console.log('✅ 默认管理员账户创建成功！');
    
    return NextResponse.json({
      success: true,
      message: '默认管理员账户创建成功！',
      data: {
        email: 'admin@jinshiying.com',
        password: 'admin123456',
        name: '系统管理员'
      }
    });
    
  } catch (error) {
    console.error('❌ 创建管理员账户失败:', error);
    return NextResponse.json({
      success: false,
      message: '创建管理员账户失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
