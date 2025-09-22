// 数据初始化脚本
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

// 确保数据目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化用户数据
const usersData = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@jinshiying.com',
    phone: '+852 12345678',
    password: 'admin123',
    role: 'admin',
    userType: 'admin_created',
    status: 'active',
    balance: 0,
    createdAt: new Date('2025-09-22T13:00:00.000Z').toISOString()
  },
  {
    id: '2',
    name: '测试用户',
    email: 'test@jinshiying.com',
    phone: '+852 98765432',
    password: 'test123',
    role: 'user',
    userType: 'admin_created',
    status: 'active',
    balance: 0,
    createdAt: new Date('2025-09-22T13:00:00.000Z').toISOString()
  }
];

// 初始化其他数据
const ordersData = [];
const paymentsData = [];
const withdrawalsData = [];
const paymentLinksData = [];

// 写入数据文件
fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(usersData, null, 2));
fs.writeFileSync(path.join(dataDir, 'orders.json'), JSON.stringify(ordersData, null, 2));
fs.writeFileSync(path.join(dataDir, 'payments.json'), JSON.stringify(paymentsData, null, 2));
fs.writeFileSync(path.join(dataDir, 'withdrawals.json'), JSON.stringify(withdrawalsData, null, 2));
fs.writeFileSync(path.join(dataDir, 'payment-links.json'), JSON.stringify(paymentLinksData, null, 2));

console.log('✅ 数据初始化完成！');
console.log('📁 数据目录:', dataDir);
console.log('👤 默认用户:');
console.log('  管理员: admin@jinshiying.com / admin123');
console.log('  测试用户: test@jinshiying.com / test123');
