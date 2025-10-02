import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 [数据库更新] 开始更新数据库结构...');
    
    const connection = await getConnection();
    
    // 添加新字段
    await connection.execute(`
      ALTER TABLE payment_links 
      ADD COLUMN IF NOT EXISTS product_image TEXT NULL,
      ADD COLUMN IF NOT EXISTS max_uses INT DEFAULT 1,
      ADD COLUMN IF NOT EXISTS used_count INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_single_use BOOLEAN DEFAULT TRUE
    `);
    
    // 更新现有记录
    await connection.execute(`
      UPDATE payment_links 
      SET 
        max_uses = 1,
        used_count = 0,
        is_single_use = TRUE
      WHERE max_uses IS NULL OR used_count IS NULL OR is_single_use IS NULL
    `);
    
    connection.release();
    
    console.log('✅ [数据库更新] 数据库结构更新成功');
    
    return NextResponse.json({
      success: true,
      message: '数据库结构更新成功'
    });
    
  } catch (error) {
    console.error('❌ [数据库更新] 更新失败:', error);
    return NextResponse.json({
      success: false,
      message: '数据库结构更新失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
