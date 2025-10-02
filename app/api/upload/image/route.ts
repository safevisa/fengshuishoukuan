import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({
        success: false,
        message: '没有上传文件'
      }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        message: '不支持的文件类型，请上传 JPG、PNG 或 WebP 格式的图片'
      }, { status: 400 });
    }

    // 验证文件大小 (最大5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: '文件大小不能超过 5MB'
      }, { status: 400 });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `product_${timestamp}_${randomString}.${fileExtension}`;

    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 保存文件
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // 返回文件URL
    const fileUrl = `/uploads/products/${fileName}`;

    console.log('✅ [图片上传] 文件上传成功:', fileUrl);

    return NextResponse.json({
      success: true,
      message: '图片上传成功',
      data: {
        fileName,
        fileUrl,
        fileSize: file.size,
        fileType: file.type
      }
    });

  } catch (error) {
    console.error('❌ [图片上传] 上传失败:', error);
    return NextResponse.json({
      success: false,
      message: '图片上传失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
