import { NextResponse } from 'next/server';
import { productionDB } from '@/lib/production-database';

export async function GET() {
  try {
    // 检查数据库连接
    const users = await productionDB.getAllUsers();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      userCount: users.length,
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    }, { status: 500 });
  }
}
