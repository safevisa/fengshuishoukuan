import { NextRequest, NextResponse } from 'next/server';
import { productionPaymentService } from '@/lib/production-payment';
import { productionDB } from '@/lib/production-database';

// 创建收款链接
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description, customerEmail, customerPhone } = body;

    // 验证输入
    if (!amount || amount <= 0) {
      return NextResponse.json({
        success: false,
        message: '请输入有效的金额'
      }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({
        success: false,
        message: '请输入收款描述'
      }, { status: 400 });
    }

    // 创建收款链接
    const linkResult = await productionPaymentService.createPaymentLink({
      amount: Number(amount),
      description,
      customerEmail,
      customerPhone
    });

    if (linkResult.success) {
      // 保存链接信息到数据库
      const linkData = {
        id: linkResult.linkId,
        amount: Number(amount),
        description,
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || '',
        paymentUrl: linkResult.paymentUrl,
        status: 'active',
        createdAt: new Date()
      };

      // 这里可以保存到数据库，暂时记录日志
      console.log('Payment link created:', linkData);

      return NextResponse.json({
        success: true,
        message: '收款链接创建成功',
        linkId: linkResult.linkId,
        paymentUrl: linkResult.paymentUrl,
        amount: Number(amount),
        description
      });
    } else {
      return NextResponse.json({
        success: false,
        message: linkResult.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Payment link creation error:', error);
    return NextResponse.json({
      success: false,
      message: '创建收款链接失败，请重试'
    }, { status: 500 });
  }
}

// 获取收款链接列表
export async function GET(request: NextRequest) {
  try {
    // 这里应该从数据库获取收款链接列表
    // 暂时返回空列表
    return NextResponse.json({
      success: true,
      links: []
    });
  } catch (error) {
    console.error('Get payment links error:', error);
    return NextResponse.json({
      success: false,
      message: '获取收款链接失败'
    }, { status: 500 });
  }
}
