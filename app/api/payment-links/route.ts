import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔗 [收款链接] 获取收款链接列表...');
    
    const paymentLinks = await mysqlDB.getAllPaymentLinks();
    console.log('✅ [收款链接] 找到链接数量:', paymentLinks.length);
    
    return NextResponse.json({
      success: true,
      paymentLinks: paymentLinks
    });
    
  } catch (error) {
    console.error('❌ [收款链接] 获取失败:', error);
    return NextResponse.json({
      success: false,
      message: '获取收款链接失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔗 [收款链接] 创建新收款链接...');
    
    const body = await request.json();
    const { 
      amount, 
      description, 
      userId, 
      productImage, 
      maxUses = 1, 
      isSingleUse = true 
    } = body;
    
    if (!amount || !description || !userId) {
      return NextResponse.json({
        success: false,
        message: '缺少必需参数'
      }, { status: 400 });
    }
    
    // 创建收款链接
    const paymentLink = await mysqlDB.addPaymentLink({
      userId: userId,
      amount: amount.toString(),
      description: description,
      status: 'active',
      paymentMethod: 'jkopay',
      transactionId: null,
      productImage: productImage || null,
      maxUses: maxUses,
      usedCount: 0,
      isSingleUse: isSingleUse
    });
    
    // 创建对应的订单
    const order = await mysqlDB.addOrder({
      userId: userId,
      amount: parseFloat(amount),
      status: 'pending',
      paymentLinkId: paymentLink.id,
      paymentMethod: 'jkopay',
      transactionId: null,
      completedAt: null
    });
    
    console.log('✅ [收款链接] 创建成功:', paymentLink.id);
    
    return NextResponse.json({
      success: true,
      paymentLink: paymentLink,
      order: order
    });
    
  } catch (error) {
    console.error('❌ [收款链接] 创建失败:', error);
    return NextResponse.json({
      success: false,
      message: '创建收款链接失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}