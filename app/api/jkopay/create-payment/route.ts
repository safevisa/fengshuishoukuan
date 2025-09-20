import { NextRequest, NextResponse } from 'next/server'
import { JKOPayRequest, JKOPayResponse } from '@/lib/jkopay-types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount, description, customerInfo } = body
    
    console.log('🚀 创建街口支付订单:', { orderId, amount, description })
    
    // 获取配置
    const apiUrl = process.env.JKOPAY_API_URL || 'https://gateway.suntone.com/payment/api/gotoPayment'
    const merchantId = process.env.JKOPAY_MERCHANT_ID || '1888'
    const terminalId = process.env.JKOPAY_TERMINAL_ID || '888506'
    const secretKey = process.env.JKOPAY_SECRET_KEY || 'fe5b2c5ea084426bb1f6269acbac902f'
    const returnUrl = process.env.JKOPAY_RETURN_URL || 'http://localhost:3001/payment/return'
    const notifyUrl = process.env.JKOPAY_NOTIFY_URL || 'http://localhost:3001/api/payment/notify'
    
    // 获取客户端IP
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1'
    
    // 构建货物信息JSON
    const goodsInfo = {
      goodsInfo: [{
        goodsID: `goods_${Date.now()}`,
        goodsName: description || '風水擺件商品',
        quantity: '1',
        goodsPrice: amount.toString()
      }]
    }
    
    // 构建街口支付请求参数（按照API规范）
    const jkopayRequest: JKOPayRequest = {
      merNo: merchantId,                    // 商户号
      terNo: terminalId,                    // 终端号
      CharacterSet: 'UTF8',                 // 编码方式
      transType: 'sales',                   // 交易类型
      transModel: 'M',                      // 模式(固定值-M)
      getPayLink: 'N',                      // 固定：N
      apiType: '1',                         // 1-普通接口
      amount: amount.toString(),             // 消费金额台币整数
      currencyCode: 'TWD',                  // 消费币种-国际统一币种代码（三位）
      orderNo: orderId,                     // 网店订单号
      merremark: description || '',         // 订单备注参数
      returnURL: returnUrl.replace(/&/g, '|'), // 网店系统接收支付结果地址
      merMgrURL: 'localhost:3001',          // 网店系统的网址
      merNotifyURL: notifyUrl.replace(/&/g, '|'), // 接收异步通知地址
      webInfo: `userAgent:${request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}`, // 消费者浏览器信息
      language: 'zh_TW',                    // 支付页面默认显示的语言
      cardCountry: 'TW',                    // 台湾
      cardState: 'Taipei',                  // 账单签收州
      cardCity: 'Taipei',                   // 账单签收城市
      cardAddress: customerInfo?.address || '台北市信义区信义路五段7号', // 账单签收人地址
      cardZipCode: '110',                   // 账单邮编
      payIP: clientIP,                      // 支付时持卡人网络的真实IP地址
      cardFullName: customerInfo?.name ? customerInfo.name.replace(' ', '.') : 'Test.User', // FristName.LastName
      cardFullPhone: customerInfo?.phone || '0912345678', // 持卡人电话
      grCountry: 'TW',                      // 台湾
      grState: 'Taipei',                    // 收货州
      grCity: 'Taipei',                     // 收货城市
      grAddress: customerInfo?.address || '台北市信义区信义路五段7号', // 收货地址
      grZipCode: '110',                     // 收货邮编
      grEmail: customerInfo?.email || 'test@example.com', // 收货邮箱
      grphoneNumber: customerInfo?.phone || '0912345678', // 收货人电话
      grPerName: customerInfo?.name ? customerInfo.name.replace(' ', '.') : 'Test.User', // 收货人姓名
      goodsString: JSON.stringify(goodsInfo), // 货物信息JSON格式
      hashcode: '',                         // 将在下面生成
      cardType: 'jkopay'                    // 街口支付
    }
    
    // 生成签名（按照API规范）
    const signString = `EncryptionMode=SHA256&CharacterSet=${jkopayRequest.CharacterSet}&merNo=${jkopayRequest.merNo}&terNo=${jkopayRequest.terNo}&orderNo=${jkopayRequest.orderNo}&currencyCode=${jkopayRequest.currencyCode}&amount=${jkopayRequest.amount}&payIP=${jkopayRequest.payIP}&transType=${jkopayRequest.transType}&transModel=${jkopayRequest.transModel}&${secretKey}`
    
    console.log('签名原始字符串:', signString)
    
    const crypto = require('crypto')
    const hashcode = crypto.createHash('sha256').update(signString, 'utf8').digest('hex')
    jkopayRequest.hashcode = hashcode
    
    console.log('生成的签名:', hashcode)
    console.log('街口支付请求参数:', jkopayRequest)
    
    // 发送请求到街口支付API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'Jinshiying-Fengshui/1.0'
      },
      body: new URLSearchParams(jkopayRequest as any).toString()
    })
    
    console.log('街口支付API响应状态:', response.status, response.statusText)
    
    const responseText = await response.text()
    console.log('街口支付API响应内容:', responseText)
    
    if (response.ok) {
      try {
        // 尝试解析JSON响应
        const jkopayResponse: JKOPayResponse = JSON.parse(responseText)
        
        console.log('街口支付API响应解析:', jkopayResponse)
        
        // 检查响应状态
        if (jkopayResponse.respCode === '00' || jkopayResponse.respCode === '0000' || jkopayResponse.respCode === '003') {
          // 成功或待处理状态
          return NextResponse.json({
            success: true,
            paymentUrl: jkopayResponse.skipTo3DURL || apiUrl,
            transactionId: jkopayResponse.tradeNo || orderId,
            message: jkopayResponse.respMsg || '支付订单创建成功',
            data: {
              orderId: jkopayResponse.orderNo,
              amount: jkopayResponse.amount,
              tradeNo: jkopayResponse.tradeNo,
              respCode: jkopayResponse.respCode,
              respMsg: jkopayResponse.respMsg,
              skipTo3DURL: jkopayResponse.skipTo3DURL,
              timestamp: new Date().toISOString()
            }
          })
        } else {
          // 失败状态
          return NextResponse.json({
            success: false,
            error: jkopayResponse.respMsg || '支付订单创建失败',
            data: {
              respCode: jkopayResponse.respCode,
              respMsg: jkopayResponse.respMsg
            }
          })
        }
      } catch (parseError) {
        // 如果不是JSON响应，可能是HTML页面
        console.log('响应不是JSON格式，可能是HTML页面')
        return NextResponse.json({
          success: true,
          paymentUrl: apiUrl,
          transactionId: orderId,
          message: '支付订单创建成功，请跳转到支付页面',
          data: {
            orderId,
            amount,
            description,
            status: 'created',
            timestamp: new Date().toISOString()
          }
        })
      }
    } else {
      return NextResponse.json({
        success: false,
        error: `API响应错误: ${response.status} ${response.statusText}`,
        data: { responseText }
      })
    }
    
  } catch (error) {
    console.error('❌ 街口支付订单创建失败:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '创建支付订单失败'
    })
  }
}
