import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;

    if (!linkId) {
      return NextResponse.json({
        success: false,
        message: '链接ID不能为空'
      }, { status: 400 });
    }

    // 从数据库获取收款链接信息
    const linkData = await productionDB.getPaymentLinkById(linkId);

    if (!linkData) {
      return NextResponse.json({
        success: false,
        message: '收款链接不存在或已失效'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      ...linkData
    });
  } catch (error) {
    console.error('Get payment link error:', error);
    return NextResponse.json({
      success: false,
      message: '获取收款链接失败'
    }, { status: 500 });
  }
}
