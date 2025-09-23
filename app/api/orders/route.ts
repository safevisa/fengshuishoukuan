import { NextRequest, NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function GET(request: NextRequest) {
  try {
    const orders = await productionDB.getAllOrders();
    return NextResponse.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({
      success: false,
      message: '获取订单列表失败'
    }, { status: 500 });
  }
}
