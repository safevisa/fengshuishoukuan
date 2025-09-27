import * as crypto from 'crypto';

export class JkoPayService {
  private config = {
    merNo: '1888', // 商户号
    terNo: '888506', // 终端号
    secretKey: 'fe5b2c5ea084426bb1f6269acbac902f', // 密钥
    baseUrl: 'https://gateway.suntone.com/payment/api',
    returnUrl: 'https://jinshiying.com/payment/return',
    notifyUrl: 'https://jinshiying.com/api/jkopay/callback',
    merMgrURL: 'https://jinshiying.com'
  };

  // 生成SHA256签名 - 按照文档要求
  generateSignature(params: Record<string, string>): string {
    // 按照文档要求的顺序拼接参数
    const signString = [
      `amount=${params.amount}`,
      `currencyCode=${params.currencyCode}`,
      `merNo=${params.merNo}`,
      `orderNo=${params.orderNo}`,
      `payIP=${params.payIP}`,
      `transType=${params.transType}`,
      `transModel=${params.transModel}`,
      `terNo=${params.terNo}`,
      this.config.secretKey
    ].join('&');
    
    console.log('🔐 [街口支付] 签名字符串:', signString);
    
    const hash = crypto.createHash('sha256');
    hash.update(signString);
    const signature = hash.digest('hex');
    
    console.log('🔐 [街口支付] 生成的签名:', signature);
    
    return signature;
  }

  // 创建支付请求参数
  createPaymentParams(orderData: {
    orderNo: string;
    amount: number;
    description?: string;
    customerInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      ip?: string;
    };
    goodsInfo?: Array<{
      goodsID: string;
      goodsName: string;
      quantity: string;
      goodsPrice: string;
    }>;
  }): Record<string, string> {
    const {
      orderNo,
      amount,
      description = '风水商品',
      customerInfo = {},
      goodsInfo = []
    } = orderData;

    // 基本参数
    const params: Record<string, string> = {
      merNo: this.config.merNo,
      terNo: this.config.terNo,
      CharacterSet: 'UTF8',
      transType: 'sales',
      transModel: 'M',
      getPayLink: 'N',
      apiType: '1',
      amount: Math.round(amount).toString(), // 金额为整数
      currencyCode: 'TWD', // 台币
      orderNo: orderNo,
      merremark: description.substring(0, 100), // 限制长度
      returnURL: this.config.returnUrl.replace(/&/g, '|'),
      merMgrURL: this.config.merMgrURL,
      merNotifyURL: this.config.notifyUrl.replace(/&/g, '|'),
      webInfo: 'userAgent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      language: 'zh_TW',
      
      // 账单信息（台湾地址）
      cardCountry: 'TW',
      cardState: 'Taipei',
      cardCity: 'Taipei',
      cardAddress: '信義區信義路五段7號',
      cardZipCode: '110',
      payIP: customerInfo.ip || '127.0.0.1',
      cardFullName: customerInfo.name ? customerInfo.name.replace(' ', '.') : 'Customer.Name',
      cardFullPhone: customerInfo.phone || '0912345678',
      
      // 收货信息
      grCountry: 'TW',
      grState: 'Taipei',
      grCity: 'Taipei',
      grAddress: '信義區信義路五段7號',
      grZipCode: '110',
      grEmail: customerInfo.email || 'customer@example.com',
      grphoneNumber: customerInfo.phone || '0912345678',
      grPerName: customerInfo.name ? customerInfo.name.replace(' ', '.') : 'Customer.Name',
      
      // 商品信息
      goodsString: JSON.stringify({
        goodsInfo: goodsInfo.length > 0 ? goodsInfo : [{
          goodsID: 'fengshui001',
          goodsName: '风水商品',
          quantity: '1',
          goodsPrice: Math.round(amount).toString()
        }]
      }),
      cardType: 'jkopay'
    };

    // 生成签名
    params.hashcode = this.generateSignature(params);
    
    return params;
  }

  // 发送支付请求
  async createPayment(orderData: {
    orderNo: string;
    amount: number;
    description?: string;
    customerInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      ip?: string;
    };
    goodsInfo?: Array<{
      goodsID: string;
      goodsName: string;
      quantity: string;
      goodsPrice: string;
    }>;
  }) {
    try {
      const paymentParams = this.createPaymentParams(orderData);
      
      console.log('📤 [街口支付] 请求参数:', JSON.stringify(paymentParams, null, 2));
      
      const response = await fetch(`${this.config.baseUrl}/gotoPayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(paymentParams).toString()
      });

      const responseText = await response.text();
      console.log('📥 [街口支付] 原始响应:', responseText);
      
      // 解析响应
      const result = Object.fromEntries(new URLSearchParams(responseText));
      console.log('📊 [街口支付] 解析后的响应:', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ [街口支付] 请求错误:', error);
      throw new Error(`支付请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 验证回调签名
  verifyCallbackSignature(callbackData: Record<string, string>): boolean {
    try {
      const {
        amount,
        currencyCode,
        merNo,
        orderNo,
        respCode,
        terNo,
        tradeNo,
        transType,
        hashcode
      } = callbackData;

      const signString = [
        `amount=${amount}`,
        `currencyCode=${currencyCode}`,
        `merNo=${merNo}`,
        `orderNo=${orderNo}`,
        `respCode=${respCode}`,
        `terNo=${terNo}`,
        `tradeNo=${tradeNo}`,
        `transType=${transType}`,
        this.config.secretKey
      ].join('&');
      
      console.log('🔐 [街口支付回调] 验证签名字符串:', signString);
      
      const expectedHash = crypto.createHash('sha256')
        .update(signString)
        .digest('hex');
      
      console.log('🔐 [街口支付回调] 期望签名:', expectedHash);
      console.log('🔐 [街口支付回调] 接收签名:', hashcode);
      
      return expectedHash === hashcode;
    } catch (error) {
      console.error('❌ [街口支付回调] 签名验证错误:', error);
      return false;
    }
  }
}

// 创建单例实例
export const jkoPayService = new JkoPayService();
