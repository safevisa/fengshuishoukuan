import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'fengshui-data.json')

// 确保数据目录存在
const ensureDataDir = () => {
  const dataDir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// 读取数据文件
const readDataFile = () => {
  try {
    ensureDataDir()
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Failed to read data file:', error)
  }
  
  // 返回默认数据结构
  return {
    users: [],
    paymentLinks: [],
    orders: [],
    payments: [],
    withdrawals: [],
    lastSync: Date.now()
  }
}

// 写入数据文件
const writeDataFile = (data: any) => {
  try {
    ensureDataDir()
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Failed to write data file:', error)
    return false
  }
}

// GET - 获取数据
export async function GET() {
  try {
    const data = readDataFile()
    return NextResponse.json({
      success: true,
      data,
      message: '数据获取成功'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '获取数据失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// POST - 保存数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证数据格式
    if (!body || typeof body !== 'object') {
      return NextResponse.json({
        success: false,
        error: '无效的数据格式'
      }, { status: 400 })
    }

    // 添加时间戳
    const dataWithTimestamp = {
      ...body,
      lastSync: Date.now(),
      serverUpdated: new Date().toISOString()
    }

    // 保存到文件
    const success = writeDataFile(dataWithTimestamp)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: '数据保存成功',
        timestamp: dataWithTimestamp.lastSync
      })
    } else {
      return NextResponse.json({
        success: false,
        error: '数据保存失败'
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '保存数据失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// DELETE - 清空数据
export async function DELETE() {
  try {
    const defaultData = {
      users: [],
      paymentLinks: [],
      orders: [],
      payments: [],
      withdrawals: [],
      lastSync: Date.now()
    }
    
    const success = writeDataFile(defaultData)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: '数据已清空'
      })
    } else {
      return NextResponse.json({
        success: false,
        error: '清空数据失败'
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: '清空数据失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}
