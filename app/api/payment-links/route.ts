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

    // 生成链接ID
    const linkId = `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建收款链接数据
    const linkData = {
      id: linkId,
      amount: Number(amount),
      description,
      customerEmail: customerEmail || '',
      customerPhone: customerPhone || '',
      status: 'active',
      createdAt: new Date()
    };

    // 保存到数据库
    await productionDB.addPaymentLink(linkData);

    // 生成支付URL
    const paymentUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jinshiying.com'}/pay/${linkId}`;

    return NextResponse.json({
      success: true,
      message: '收款链接创建成功',
      linkId: linkId,
      paymentUrl: paymentUrl,
      amount: Number(amount),
      description
    });
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
    const links = await productionDB.getAllPaymentLinks();
    return NextResponse.json({
      success: true,
      links: links
    });
  } catch (error) {
    console.error('Get payment links error:', error);
    return NextResponse.json({
      success: false,
      message: '获取收款链接失败'
    }, { status: 500 });
  }
}
