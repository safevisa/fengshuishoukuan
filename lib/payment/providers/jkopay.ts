import * as crypto from 'crypto';
import { PaymentService, PaymentRequest, PaymentResponse, PaymentCallback, PaymentMethod, RegionCode, CurrencyCode, PaymentConfig } from '../types';

export class JkoPayService implements PaymentService {
  public readonly method: PaymentMethod = 'jkopay';
  public readonly region: RegionCode = 'TW';
  public readonly currency: CurrencyCode = 'TWD';
  
  private config: PaymentConfig;

  constructor(config: PaymentConfig) {
    this.config = config;
  }

  // 生成SHA256签名 - 严格按照街口支付API文档
  private generateSignature(params: Record<string, string>): string {
    // 根据街口支付API文档示例：
    // amount=98&currencyCode=TWD&merNo=1888&orderNo=109116361045&payIP=116.30.222.69&transType=sales&transModel=M&terNo=88816&<密钥>
    const signString = 
      `amount=${params.amount}` +
      `&currencyCode=${params.currencyCode}` +
      `&merNo=${params.merNo}` +
      `&orderNo=${params.orderNo}` +
      `&payIP=${params.payIP}` +
      `&transType=${params.transType}` +
      `&transModel=${params.transModel}` +
      `&terNo=${params.terNo}` +
      `&${this.config.credentials.secretKey}`;

    console.log('🔐 [街口支付] 签名字符串:', signString);
    
    const hash = crypto.createHash('sha256');
    hash.update(signString, 'utf8');
    const signature = hash.digest('hex');
    
    console.log('🔐 [街口支付] 生成的签名:', signature);
    
    return signature;
  }

  // 创建支付请求参数 - 严格按照API文档
  private createPaymentParams(request: PaymentRequest): Record<string, string> {
    const {
      orderNo,
      amount,
      description,
      customerInfo,
      goodsInfo = []
    } = request;

    // 基本参数 - 严格按照街口支付API文档
    const params: Record<string, string> = {
      // 必需参数
      merNo: this.config.credentials.merNo,
      terNo: this.config.credentials.terNo,
      orderNo: orderNo,
      currencyCode: this.currency,
      amount: Math.round(amount).toString(), // 金额为整数
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
      returnURL: this.config.endpoints.return.replace(/&/g, '|'),
      merMgrURL: this.config.credentials.merMgrURL || 'https://jinshiying.com',
      merNotifyURL: this.config.endpoints.callback.replace(/&/g, '|'),
      
      // 浏览器信息
      webInfo: 'userAgent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      language: 'zh_TW',
      
      // 账单信息（台湾地址）
      cardCountry: 'TW',
      cardState: 'Taipei',
      cardCity: 'Taipei',
      cardAddress: customerInfo.address?.address || '台北市信义区信义路五段7号',
      cardZipCode: customerInfo.address?.zipCode || '110',
      cardFullName: customerInfo.name ? customerInfo.name.replace(' ', '.') : 'Test.User',
      cardFullPhone: customerInfo.phone || '0912345678',
      
      // 收货信息
      grCountry: 'TW',
      grState: 'Taipei',
      grCity: 'Taipei',
      grAddress: customerInfo.address?.address || '台北市信义区信义路五段7号',
      grZipCode: customerInfo.address?.zipCode || '110',
      grEmail: customerInfo.email || 'test@example.com',
      grphoneNumber: customerInfo.phone || '0912345678',
      grPerName: customerInfo.name ? customerInfo.name.replace(' ', '.') : 'Test.User',
      
      // 商品信息
      goodsString: JSON.stringify({
        goodsInfo: goodsInfo.length > 0 ? goodsInfo : [{
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
    params.hashcode = this.generateSignature(params);
    
    return params;
  }

  // 创建支付
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const paymentParams = this.createPaymentParams(request);
      
      console.log('📤 [街口支付] 请求参数:', JSON.stringify(paymentParams, null, 2));
      
      const response = await fetch(this.config.endpoints.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(paymentParams).toString()
      });

      const responseText = await response.text();
      console.log('📥 [街口支付] 原始响应:', responseText);
      
      // 解析响应
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        // 如果不是JSON，尝试解析为URL参数
        result = Object.fromEntries(new URLSearchParams(responseText));
      }
      
      console.log('📊 [街口支付] 解析后的响应:', result);
      
      const { respCode, respMsg, skipTo3DURL, tradeNo } = result;
      
      // 检查响应状态
      const isSuccess = respCode === '00' || respCode === '000' || respCode === '0000' || respCode === '003' || respCode === '004';
      
      return {
        success: isSuccess,
        orderNo: request.orderNo,
        respCode: respCode || 'ERROR',
        respMsg: respMsg || 'Unknown error',
        paymentUrl: skipTo3DURL,
        amount: request.amount,
        currency: this.currency,
        tradeNo: tradeNo,
        transactionId: tradeNo,
        metadata: result
      };
      
    } catch (error) {
      console.error('❌ [街口支付] 请求错误:', error);
      throw new Error(`支付请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  // 验证回调签名 - 严格按照API文档
  verifyCallback(callback: PaymentCallback): boolean {
    try {
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
        signature
      } = callback;

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
        this.config.credentials.secretKey
      ].join('&');
      
      console.log('🔐 [街口支付回调] 验证签名字符串:', signString);
      
      const expectedHash = crypto.createHash('sha256')
        .update(signString, 'utf8')
        .digest('hex');
      
      console.log('🔐 [街口支付回调] 期望签名:', expectedHash);
      console.log('🔐 [街口支付回调] 接收签名:', signature);
      
      return expectedHash === signature;
    } catch (error) {
      console.error('❌ [街口支付回调] 签名验证错误:', error);
      return false;
    }
  }

  // 处理回调
  async handleCallback(callback: PaymentCallback): Promise<{
    success: boolean;
    orderId: string;
    status: 'completed' | 'failed' | 'pending';
    amount: number;
    transactionId?: string;
  }> {
    try {
      // 验证签名
      const signatureValid = this.verifyCallback(callback);
      if (!signatureValid) {
        console.log('⚠️ [街口支付回调] 签名验证失败');
      }

      // 从订单号中提取支付链接ID
      const parts = callback.orderNo.split('_');
      const linkId = parts.slice(0, 3).join('_');
      
      // 判断支付状态
      const isSuccess = callback.respCode === '00' || callback.respCode === '000' || callback.respCode === '0000';
      
      return {
        success: isSuccess,
        orderId: linkId,
        status: isSuccess ? 'completed' : 'failed',
        amount: parseFloat(callback.amount),
        transactionId: callback.tradeNo || callback.transactionId
      };
      
    } catch (error) {
      console.error('❌ [街口支付回调] 处理失败:', error);
      return {
        success: false,
        orderId: callback.orderNo,
        status: 'failed',
        amount: 0
      };
    }
  }

  // 退款（街口支付暂不支持）
  async refund(transactionId: string, amount: number, reason?: string): Promise<{
    success: boolean;
    refundId?: string;
    message?: string;
  }> {
    return {
      success: false,
      message: '街口支付暂不支持退款功能'
    };
  }

  // 查询支付状态（街口支付暂不支持）
  async queryPayment(orderNo: string): Promise<{
    success: boolean;
    status: 'completed' | 'failed' | 'pending';
    amount?: number;
    transactionId?: string;
  }> {
    return {
      success: false,
      status: 'pending',
      message: '街口支付暂不支持查询功能'
    };
  }
}
