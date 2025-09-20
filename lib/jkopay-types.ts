// 街口支付API请求接口定义
export interface JKOPayRequest {
  merNo: string;                    // 商户号
  terNo: string;                    // 终端号
  CharacterSet: string;             // 编码方式
  transType: string;                // 交易类型
  transModel: string;               // 模式(固定值-M)
  getPayLink: string;               // 固定：N
  apiType: string;                  // 1-普通接口
  amount: string;                   // 消费金额台币整数
  currencyCode: string;             // 消费币种-国际统一币种代码（三位）
  orderNo: string;                  // 网店订单号
  merremark: string;                // 订单备注参数
  returnURL: string;                // 网店系统接收支付结果地址
  merMgrURL: string;                // 网店系统的网址
  merNotifyURL: string;             // 接收异步通知地址
  webInfo: string;                  // 消费者浏览器信息
  language: string;                 // 支付页面默认显示的语言
  cardCountry: string;              // 台湾
  cardState: string;                // 账单签收州
  cardCity: string;                 // 账单签收城市
  cardAddress: string;              // 账单签收人地址
  cardZipCode: string;              // 账单邮编
  payIP: string;                    // 支付时持卡人网络的真实IP地址
  cardFullName: string;             // FristName.LastName (中间用点连接)
  cardFullPhone: string;            // 持卡人电话
  grCountry: string;                // 台湾
  grState: string;                  // 收货州
  grCity: string;                   // 收货城市
  grAddress: string;                // 收货地址
  grZipCode: string;                // 收货邮编
  grEmail: string;                  // 收货邮箱
  grphoneNumber: string;            // 收货人电话
  grPerName: string;                // 收货人姓名 使用.进行连接
  goodsString: string;              // 货物信息JSON格式
  hashcode: string;                 // 签名
  cardType: string;                 // 街口支付
}

// 街口支付API响应接口定义
export interface JKOPayResponse {
  transType: string;                // 交易类型：sales,test
  orderNo: string;                  // 商户订单号
  merNo: string;                    // 商户号
  terNo: string;                    // 终端号
  currencyCode: string;             // 订单币种
  amount: string;                   // 消费金额
  tradeNo: string;                  // 支付系统交易流水号
  hashcode: string;                 // 签名值
  respCode: string;                 // 支付状态：00-成功, 0000-预授权成功, 003-待处理, 01-失败
  respMsg: string;                  // 支付结果描述
  acquirer: string;                 // 账单名称
  settleCurrency: string;           // 结算币种
  settleAmount: string;             // 结算金额
  skipTo3DURL: string;              // 跳转URL，如果不为空则需要浏览器重定向
  merNotifyURL: null;               // null
  merremark: null;                  // null
}

// 内部API响应接口
export interface InternalAPIResponse {
  success: boolean;
  message?: string;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
  data?: any;
}
