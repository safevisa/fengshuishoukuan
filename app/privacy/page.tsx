import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
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
            <CardTitle className="text-2xl text-amber-800">隱私授權政策</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">個人資料收集</h3>
                <p>
                  香港京世盈有限公司承諾保護您的個人隱私。我們僅在必要時收集您的個人資料，包括姓名、聯絡方式、送貨地址等，用於處理訂單和提供服務。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">資料使用目的</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>處理您的訂單和付款</li>
                  <li>安排商品配送</li>
                  <li>提供客戶服務支援</li>
                  <li>發送重要通知和更新</li>
                  <li>改善我們的服務品質</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">資料保護措施</h3>
                <p>
                  我們採用業界標準的安全措施保護您的個人資料，包括加密傳輸、安全存儲和限制存取權限。您的資料不會在未經授權的情況下被分享給第三方。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">您的權利</h3>
                <p>您有權查詢、更正或刪除您的個人資料。如有任何疑問，請聯絡我們的客服團隊。</p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
