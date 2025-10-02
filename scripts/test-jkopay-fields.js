#!/usr/bin/env node

/**
 * 街口支付字段测试脚本
 * 验证所有字段命名是否符合API文档要求
 */

const crypto = require('crypto');

// 街口支付配置
const config = {
  merNo: '1888',
  terNo: '88816',
  secretKey: 'fe5b2c5ea084426bb1f6269acbac902f',
  baseUrl: 'https://gateway.suntone.com/payment/api',
  returnUrl: 'https://jinshiying.com/payment/return',
  notifyUrl: 'https://jinshiying.com/api/jkopay/callback',
  merMgrURL: 'https://jinshiying.com'
};

// 测试订单数据
const testOrder = {
  orderNo: 'link_1234567890_9876543210_abcdef123_1704067200000',
  amount: 100,
  description: '风水商品测试',
  customerInfo: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '0912345678',
    ip: '127.0.0.1'
  }
};

// 生成签名函数
function generateSignature(params) {
  const signString = 
    `amount=${params.amount}` +
    `&currencyCode=${params.currencyCode}` +
    `&merNo=${params.merNo}` +
    `&orderNo=${params.orderNo}` +
    `&payIP=${params.payIP}` +
    `&transType=${params.transType}` +
    `&transModel=${params.transModel}` +
    `&terNo=${params.terNo}` +
    `&${config.secretKey}`;

  console.log('🔐 签名字符串:', signString);
  
  const hash = crypto.createHash('sha256');
  hash.update(signString, 'utf8');
  const signature = hash.digest('hex');
  
  console.log('🔐 生成的签名:', signature);
  
  return signature;
}

// 创建支付参数
function createPaymentParams(orderData) {
  const {
    orderNo,
    amount,
    description,
    customerInfo = {}
  } = orderData;

  // 基本参数 - 严格按照街口支付API文档
  const params = {
    // 必需参数
    merNo: config.merNo,
    terNo: config.terNo,
    orderNo: orderNo,
    currencyCode: 'TWD',
    amount: Math.round(amount).toString(),
    payIP: customerInfo.ip || '127.0.0.1',
    transType: 'sales',
    transModel: 'M',
    apiType: '1',
    getPayLink: 'N',
    
    // 加密和编码
    EncryptionMode: 'SHA256',
    CharacterSet: 'UTF8',
    
    // 订单信息
    merremark: description.substring(0, 100),
    returnURL: config.returnUrl.replace(/&/g, '|'),
    merMgrURL: config.merMgrURL,
    merNotifyURL: config.notifyUrl.replace(/&/g, '|'),
    
    // 浏览器信息
    webInfo: 'userAgent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    language: 'zh_TW',
    
    // 账单信息（台湾地址）
    cardCountry: 'TW',
    cardState: 'Taipei',
    cardCity: 'Taipei',
    cardAddress: '台北市信义区信义路五段7号',
    cardZipCode: '110',
    cardFullName: customerInfo.name ? customerInfo.name.replace(' ', '.') : 'Test.User',
    cardFullPhone: customerInfo.phone || '0912345678',
    
    // 收货信息
    grCountry: 'TW',
    grState: 'Taipei',
    grCity: 'Taipei',
    grAddress: '台北市信义区信义路五段7号',
    grZipCode: '110',
    grEmail: customerInfo.email || 'test@example.com',
    grphoneNumber: customerInfo.phone || '0912345678',
    grPerName: customerInfo.name ? customerInfo.name.replace(' ', '.') : 'Test.User',
    
    // 商品信息
    goodsString: JSON.stringify({
      goodsInfo: [{
        goodsID: 'fengshui001',
        goodsName: description,
        quantity: '1',
        goodsPrice: Math.round(amount).toString()
      }]
    }),
    
    // 支付类型
    cardType: 'jkopay'
  };

  // 生成签名
  params.hashcode = generateSignature(params);
  
  return params;
}

// 验证回调签名
function verifyCallbackSignature(callbackData) {
  const {
    amount,
    currencyCode,
    merNo,
    orderNo,
    respCode,
    respMsg,
    terNo,
    tradeNo,
    transType,
    hashcode
  } = callbackData;

  // 根据街口支付API文档，回调签名格式：
  // hash256(amount=98.99&currencyCode=TWD&merNo=1888&orderNo=109116361045&respCode=01&respMsg=Get source URL fails&terNo=88816&tradeNo=BA1512281121473675&transType=sales&密钥)
  const signString = [
    `amount=${amount}`,
    `currencyCode=${currencyCode}`,
    `merNo=${merNo}`,
    `orderNo=${orderNo}`,
    `respCode=${respCode}`,
    `respMsg=${respMsg || ''}`,
    `terNo=${terNo}`,
    `tradeNo=${tradeNo}`,
    `transType=${transType}`,
    config.secretKey
  ].join('&');
  
  console.log('🔐 回调验证签名字符串:', signString);
  
  const expectedHash = crypto.createHash('sha256')
    .update(signString, 'utf8')
    .digest('hex');
  
  console.log('🔐 期望签名:', expectedHash);
  console.log('🔐 接收签名:', hashcode);
  
  return expectedHash === hashcode;
}

// 运行测试
console.log('🧪 开始测试街口支付字段命名...\n');

console.log('1. 测试支付参数生成:');
const paymentParams = createPaymentParams(testOrder);
console.log('✅ 支付参数生成成功');
console.log('📋 参数数量:', Object.keys(paymentParams).length);
console.log('📋 必需参数检查:');
console.log('  - merNo:', paymentParams.merNo);
console.log('  - terNo:', paymentParams.terNo);
console.log('  - orderNo:', paymentParams.orderNo);
console.log('  - currencyCode:', paymentParams.currencyCode);
console.log('  - amount:', paymentParams.amount);
console.log('  - payIP:', paymentParams.payIP);
console.log('  - transType:', paymentParams.transType);
console.log('  - transModel:', paymentParams.transModel);
console.log('  - apiType:', paymentParams.apiType);
console.log('  - getPayLink:', paymentParams.getPayLink);
console.log('  - hashcode:', paymentParams.hashcode);

console.log('\n2. 测试回调签名验证:');
const testCallback = {
  amount: '100',
  currencyCode: 'TWD',
  merNo: '1888',
  orderNo: 'link_1234567890_9876543210_abcdef123_1704067200000',
  respCode: '00',
  respMsg: 'Success',
  terNo: '88816',
  tradeNo: 'BA1512281121473675',
  transType: 'sales',
  hashcode: 'test_hash'
};

const isValid = verifyCallbackSignature(testCallback);
console.log('✅ 回调签名验证:', isValid ? '通过' : '失败');

console.log('\n3. 字段命名检查:');
const requiredFields = [
  'merNo', 'terNo', 'orderNo', 'currencyCode', 'amount', 'payIP',
  'transType', 'transModel', 'apiType', 'getPayLink', 'EncryptionMode',
  'CharacterSet', 'merremark', 'returnURL', 'merMgrURL', 'merNotifyURL',
  'webInfo', 'language', 'cardCountry', 'cardState', 'cardCity',
  'cardAddress', 'cardZipCode', 'cardFullName', 'cardFullPhone',
  'grCountry', 'grState', 'grCity', 'grAddress', 'grZipCode',
  'grEmail', 'grphoneNumber', 'grPerName', 'goodsString', 'cardType', 'hashcode'
];

const missingFields = requiredFields.filter(field => !(field in paymentParams));
if (missingFields.length === 0) {
  console.log('✅ 所有必需字段都存在');
} else {
  console.log('❌ 缺少字段:', missingFields);
}

console.log('\n4. 数据类型检查:');
console.log('  - amount 是字符串:', typeof paymentParams.amount === 'string');
console.log('  - amount 是整数:', Number.isInteger(Number(paymentParams.amount)));
console.log('  - goodsString 是JSON:', typeof paymentParams.goodsString === 'string');

console.log('\n🎉 街口支付字段测试完成！');
