#!/usr/bin/env node

// 数据库连接测试脚本
const { checkDatabaseHealth, executeQuery } = require('../lib/database');

async function testDatabase() {
  console.log('🧪 开始测试MySQL数据库连接...');
  
  try {
    // 1. 测试连接健康状态
    console.log('1️⃣ 测试数据库连接健康状态...');
    const isHealthy = await checkDatabaseHealth();
    
    if (isHealthy) {
      console.log('✅ 数据库连接健康');
    } else {
      console.log('❌ 数据库连接不健康');
      process.exit(1);
    }
    
    // 2. 测试基本查询
    console.log('2️⃣ 测试基本查询...');
    const tables = await executeQuery('SHOW TABLES');
    console.log('📊 数据库表:', tables.map(t => Object.values(t)[0]));
    
    // 3. 测试用户表
    console.log('3️⃣ 测试用户表...');
    const users = await executeQuery('SELECT COUNT(*) as count FROM users');
    console.log('👥 用户数量:', users[0].count);
    
    // 4. 测试支付链接表
    console.log('4️⃣ 测试支付链接表...');
    const links = await executeQuery('SELECT COUNT(*) as count FROM payment_links');
    console.log('🔗 支付链接数量:', links[0].count);
    
    // 5. 测试订单表
    console.log('5️⃣ 测试订单表...');
    const orders = await executeQuery('SELECT COUNT(*) as count FROM orders');
    console.log('📦 订单数量:', orders[0].count);
    
    // 6. 测试支付记录表
    console.log('6️⃣ 测试支付记录表...');
    const payments = await executeQuery('SELECT COUNT(*) as count FROM payments');
    console.log('💳 支付记录数量:', payments[0].count);
    
    console.log('✅ 数据库测试完成！所有功能正常');
    
  } catch (error) {
    console.error('❌ 数据库测试失败:', error.message);
    console.error('请检查：');
    console.error('1. MySQL服务是否运行');
    console.error('2. 数据库连接配置是否正确');
    console.error('3. 数据库表是否已创建');
    process.exit(1);
  }
}

// 运行测试
testDatabase();
