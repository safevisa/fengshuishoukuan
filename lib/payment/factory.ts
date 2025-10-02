import { PaymentService, PaymentMethod, RegionCode, CurrencyCode, PaymentFactoryConfig } from './types';
import { JkoPayService } from './providers/jkopay';
// 未来可以添加其他支付方式
// import { StripeService } from './providers/stripe';
// import { PayPalService } from './providers/paypal';
// import { AlipayService } from './providers/alipay';

export class PaymentFactory {
  private static services: Map<string, PaymentService> = new Map();
  private static config: PaymentFactoryConfig = {};

  // 初始化支付配置
  static initialize(config: PaymentFactoryConfig) {
    this.config = config;
    this.initializeServices();
  }

  // 初始化支付服务
  private static initializeServices() {
    // 街口支付 (台湾)
    if (this.config.jkopay?.isEnabled) {
      const jkopayService = new JkoPayService(this.config.jkopay);
      this.services.set('jkopay_TW', jkopayService);
    }

    // 未来可以添加其他支付方式
    // Stripe (美国/欧洲)
    // if (this.config.stripe?.isEnabled) {
    //   const stripeService = new StripeService(this.config.stripe);
    //   this.services.set('stripe_US', stripeService);
    //   this.services.set('stripe_EU', stripeService);
    // }

    // PayPal (全球)
    // if (this.config.paypal?.isEnabled) {
    //   const paypalService = new PayPalService(this.config.paypal);
    //   this.services.set('paypal_GLOBAL', paypalService);
    // }

    // 支付宝 (中国)
    // if (this.config.alipay?.isEnabled) {
    //   const alipayService = new AlipayService(this.config.alipay);
    //   this.services.set('alipay_CN', alipayService);
    // }
  }

  // 获取支付服务
  static getService(method: PaymentMethod, region: RegionCode): PaymentService | null {
    const key = `${method}_${region}`;
    return this.services.get(key) || null;
  }

  // 获取所有可用的支付方式
  static getAvailableMethods(region: RegionCode): PaymentMethod[] {
    const methods: PaymentMethod[] = [];
    for (const [key, service] of this.services) {
      if (key.endsWith(`_${region}`)) {
        const method = key.split('_')[0] as PaymentMethod;
        if (!methods.includes(method)) {
          methods.push(method);
        }
      }
    }
    return methods;
  }

  // 获取支持的货币
  static getSupportedCurrencies(method: PaymentMethod, region: RegionCode): CurrencyCode[] {
    const service = this.getService(method, region);
    if (!service) return [];

    // 根据地区和支付方式返回支持的货币
    const currencyMap: Record<string, CurrencyCode[]> = {
      'jkopay_TW': ['TWD'],
      'stripe_US': ['USD'],
      'stripe_EU': ['EUR', 'GBP'],
      'paypal_GLOBAL': ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
      'alipay_CN': ['CNY'],
    };

    return currencyMap[`${method}_${region}`] || [];
  }

  // 检查支付方式是否可用
  static isMethodAvailable(method: PaymentMethod, region: RegionCode): boolean {
    return this.getService(method, region) !== null;
  }

  // 获取默认支付方式
  static getDefaultMethod(region: RegionCode): PaymentMethod | null {
    const availableMethods = this.getAvailableMethods(region);
    return availableMethods.length > 0 ? availableMethods[0] : null;
  }
}
