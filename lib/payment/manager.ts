import { PaymentFactory } from './factory';
import { paymentConfig } from './config';
import { PaymentRequest, PaymentResponse, PaymentCallback, PaymentMethod, RegionCode } from './types';

// 初始化支付服务
PaymentFactory.initialize(paymentConfig);

export class PaymentManager {
  // 创建支付
  static async createPayment(
    method: PaymentMethod,
    region: RegionCode,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    const service = PaymentFactory.getService(method, region);
    
    if (!service) {
      throw new Error(`支付方式 ${method} 在地区 ${region} 不可用`);
    }
    
    return await service.createPayment(request);
  }

  // 处理支付回调
  static async handleCallback(
    method: PaymentMethod,
    region: RegionCode,
    callback: PaymentCallback
  ): Promise<{
    success: boolean;
    orderId: string;
    status: 'completed' | 'failed' | 'pending';
    amount: number;
    transactionId?: string;
  }> {
    const service = PaymentFactory.getService(method, region);
    
    if (!service) {
      throw new Error(`支付方式 ${method} 在地区 ${region} 不可用`);
    }
    
    return await service.handleCallback(callback);
  }

  // 验证回调签名
  static verifyCallback(
    method: PaymentMethod,
    region: RegionCode,
    callback: PaymentCallback
  ): boolean {
    const service = PaymentFactory.getService(method, region);
    
    if (!service) {
      return false;
    }
    
    return service.verifyCallback(callback);
  }

  // 获取可用的支付方式
  static getAvailableMethods(region: RegionCode): PaymentMethod[] {
    return PaymentFactory.getAvailableMethods(region);
  }

  // 获取支持的货币
  static getSupportedCurrencies(method: PaymentMethod, region: RegionCode): string[] {
    return PaymentFactory.getSupportedCurrencies(method, region);
  }

  // 检查支付方式是否可用
  static isMethodAvailable(method: PaymentMethod, region: RegionCode): boolean {
    return PaymentFactory.isMethodAvailable(method, region);
  }

  // 获取默认支付方式
  static getDefaultMethod(region: RegionCode): PaymentMethod | null {
    return PaymentFactory.getDefaultMethod(region);
  }

  // 根据IP地址推断地区
  static getRegionFromIP(ip: string): RegionCode {
    // 这里可以集成IP地理位置服务
    // 暂时返回默认值
    return 'TW';
  }

  // 根据用户偏好选择支付方式
  static selectPaymentMethod(
    userRegion: RegionCode,
    preferredMethods?: PaymentMethod[]
  ): PaymentMethod | null {
    const availableMethods = this.getAvailableMethods(userRegion);
    
    if (preferredMethods) {
      for (const method of preferredMethods) {
        if (availableMethods.includes(method)) {
          return method;
        }
      }
    }
    
    return this.getDefaultMethod(userRegion);
  }
}
