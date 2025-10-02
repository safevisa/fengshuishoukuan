// 使用动态导入来支持 ES 模块
async function createAdminUser() {
  try {
    const { mysqlDB } = await import('../lib/mysql-database.js');
    
    console.log('🔧 开始创建默认管理员账户...');
    
    // 检查是否已存在管理员
    const existingAdmin = await mysqlDB.getUserByEmail('admin@jinshiying.com');
    if (existingAdmin) {
      console.log('✅ 管理员账户已存在:', existingAdmin.email);
      return;
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
    console.log('📧 邮箱: admin@jinshiying.com');
    console.log('🔑 密码: admin123456');
    console.log('⚠️  请在生产环境中修改默认密码！');
    
  } catch (error) {
    console.error('❌ 创建管理员账户失败:', error);
  } finally {
    process.exit(0);
  }
}

createAdminUser();