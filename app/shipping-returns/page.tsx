import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Truck, RotateCcw, Clock, Shield } from "lucide-react"
import Link from "next/link"

export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首頁
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-800 flex items-center">
                <Truck className="h-6 w-6 mr-2" />
                物流配送規則
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">配送範圍</h4>
                <p className="text-gray-700">我們提供台灣本島及離島地區配送服務，部分偏遠地區可能需要額外配送時間。</p>
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">配送時間</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>台灣本島：1-3個工作天</li>
                  <li>離島地區：3-5個工作天</li>
                  <li>特殊商品：5-7個工作天</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">運費標準</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>訂單滿 NT$ 2,000 免運費</li>
                  <li>一般商品運費 NT$ 150</li>
                  <li>大型商品運費 NT$ 300</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-800 flex items-center">
                <RotateCcw className="h-6 w-6 mr-2" />
                退貨換貨規則
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  退貨期限
                </h4>
                <p className="text-gray-700">
                  商品到貨後 7 天內可申請退貨，風水擺件類商品因特殊性質，需保持原包裝完整。
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">退貨條件</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>商品必須保持全新狀態</li>
                  <li>原包裝、配件、說明書需完整</li>
                  <li>不得有人為損壞或使用痕跡</li>
                  <li>開光商品恕不接受退貨</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">退款方式</h4>
                <p className="text-gray-700">退款將於收到退貨商品並確認無誤後 3-5 個工作天內退回原付款方式。</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-800 flex items-center">
                <Shield className="h-6 w-6 mr-2" />
                品質保證
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">商品保證</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>所有商品均為正品，提供品質保證</li>
                  <li>風水擺件經專業開光加持</li>
                  <li>如收到瑕疵品，可免費換貨</li>
                  <li>提供專業風水諮詢服務</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 mb-2">客服聯絡</h4>
                <p className="text-gray-700">如有任何問題，請聯絡客服：+852 61588111 或 service@crf.hk</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
