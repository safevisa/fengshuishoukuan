import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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

        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-800">服務條款</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">服務說明</h3>
                <p>
                  歡迎使用京世盈風水電商平台。本服務條款規範您與香港京世盈有限公司之間的關係，請仔細閱讀並遵守以下條款。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">帳戶註冊</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>您必須提供真實、準確的個人資料</li>
                  <li>您有責任保護帳戶密碼的安全性</li>
                  <li>一個手機號碼或電子郵件只能註冊一個帳戶</li>
                  <li>如發現虛假資料，我們有權終止您的帳戶</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">商品訂購</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>所有商品價格以網站顯示為準</li>
                  <li>我們保留修改價格的權利，但已確認訂單不受影響</li>
                  <li>商品庫存以實際為準，缺貨時我們會及時通知</li>
                  <li>風水擺件均經過專業開光，請妥善保管</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">付款與配送</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>我們接受信用卡、銀行轉帳、貨到付款等方式</li>
                  <li>訂單確認後，請在指定時間內完成付款</li>
                  <li>配送時間依地區而定，詳見物流規則</li>
                  <li>收貨時請檢查商品完整性，如有問題請立即聯繫客服</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">退貨與退款</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>商品到貨後7天內可申請退貨</li>
                  <li>退貨商品必須保持全新狀態，包裝完整</li>
                  <li>開光商品恕不接受退貨</li>
                  <li>退款將於收到退貨商品後3-5個工作天處理</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">用戶責任</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>不得利用本平台進行任何違法活動</li>
                  <li>不得惡意下單或干擾平台正常運作</li>
                  <li>尊重其他用戶和平台工作人員</li>
                  <li>遵守相關法律法規和平台規則</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">免責聲明</h3>
                <p>
                  風水擺件僅供參考，其效果因人而異。我們不保證任何風水效果，請理性對待。因個人使用不當造成的任何損失，本公司概不負責。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">條款修改</h3>
                <p>
                  我們保留隨時修改本服務條款的權利。修改後的條款將在網站上公布，繼續使用服務即表示您同意修改後的條款。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">聯絡我們</h3>
                <p>
                  如有任何疑問，請聯絡客服：<br />
                  電話：+852 61588111<br />
                  郵箱：service@crf.hk
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
