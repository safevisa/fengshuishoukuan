import { NextRequest, NextResponse } from 'next/server';
import { PaymentManager } from '@/lib/payment/manager';
import { getSupportedCurrencies, getDefaultPaymentMethod } from '@/lib/payment/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'TW';
    
    console.log('💳 [支付方式] 获取支付方式列表，地区:', region);
    
    // 获取可用的支付方式
    const availableMethods = PaymentManager.getAvailableMethods(region as any);
    
    // 获取默认支付方式
    const defaultMethod = getDefaultPaymentMethod(region);
    
    // 构建支付方式详情
    const paymentMethods = availableMethods.map(method => {
      const supportedCurrencies = PaymentManager.getSupportedCurrencies(method, region as any);
      
      return {
        method,
        region,
        isDefault: method === defaultMethod,
        supportedCurrencies,
        features: {
          supportsRefund: method === 'stripe' || method === 'paypal' || method === 'alipay',
          supportsPartialRefund: method === 'stripe' || method === 'paypal',
          supportsWebhook: true,
          supports3DS: method === 'jkopay' || method === 'stripe'
        }
      };
    });
    
    console.log('✅ [支付方式] 找到支付方式数量:', paymentMethods.length);
    
    return NextResponse.json({
      success: true,
      region,
      defaultMethod,
      paymentMethods
    });
    
  } catch (error) {
    console.error('❌ [支付方式] 获取失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取支付方式失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
