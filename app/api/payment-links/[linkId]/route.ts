import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;
    
    console.log('🔍 [支付链接详情] 查找链接:', linkId);
    
    if (!linkId) {
      return NextResponse.json({
        success: false,
        message: '链接ID不能为空'
      }, { status: 400 });
    }
    
    const paymentLink = await mysqlDB.getPaymentLinkById(linkId);
    
    if (!paymentLink) {
      console.log('❌ [支付链接详情] 链接不存在:', linkId);
      return NextResponse.json({
        success: false,
        message: '收款链接不存在或已失效'
      }, { status: 404 });
    }
    
    console.log('✅ [支付链接详情] 找到链接:', paymentLink);
    
    return NextResponse.json({
      success: true,
      data: paymentLink
    });
    
  } catch (error) {
    console.error('❌ [支付链接详情] 获取失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取支付链接详情失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const { linkId } = params;
    
    console.log('🗑️ [删除收款链接] 开始删除:', linkId);
    
    // 检查链接是否存在
    const paymentLink = await mysqlDB.getPaymentLinkById(linkId);
    if (!paymentLink) {
      return NextResponse.json({
        success: false,
        message: '收款链接不存在'
      }, { status: 404 });
    }
    
    // 删除收款链接
    const deleted = await mysqlDB.deletePaymentLink(linkId);
    
    if (deleted) {
      console.log('✅ [删除收款链接] 删除成功:', linkId);
      return NextResponse.json({
        success: true,
        message: '收款链接删除成功'
      });
    } else {
      console.log('❌ [删除收款链接] 删除失败:', linkId);
      return NextResponse.json({
        success: false,
        message: '删除失败'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ [删除收款链接] 删除失败:', error);
    return NextResponse.json({
      success: false,
      message: '删除失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}