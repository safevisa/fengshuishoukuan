import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

export async function GET(request: NextRequest) {
  try {
    const orders = await mysqlDB.getAllOrders();
    return NextResponse.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({
      success: false,
      message: '獲取訂單列表失敗'
    }, { status: 500 });
  }
}

