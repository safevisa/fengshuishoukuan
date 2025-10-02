import { NextRequest, NextResponse } from 'next/server';
import { mysqlDB } from '@/lib/mysql-database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const orderId = searchParams.get('orderId');
    
    console.log('🔍 [订单查询] 查询参数:', { userId, status, startDate, endDate, orderId });
    
    // 获取所有订单
    const allOrders = await mysqlDB.getAllOrders();
    
    // 过滤订单
    let filteredOrders = allOrders;
    
    if (userId) {
      filteredOrders = filteredOrders.filter(order => 
        order.userId === userId || order.user_id === userId
      );
    }
    
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    if (orderId) {
      filteredOrders = filteredOrders.filter(order => 
        order.id.toLowerCase().includes(orderId.toLowerCase())
      );
    }
    
    if (startDate || endDate) {
      filteredOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        if (startDate && orderDate < new Date(startDate)) return false;
        if (endDate && orderDate > new Date(endDate)) return false;
        return true;
      });
    }
    
    console.log('✅ [订单查询] 找到订单数量:', filteredOrders.length);
    
    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      count: filteredOrders.length
    });
    
  } catch (error) {
    console.error('❌ [订单查询] 查询失败:', error);
    return NextResponse.json({
      success: false,
      message: '订单查询失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
