import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DataPolicyPage() {
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
            <CardTitle className="text-2xl text-amber-800">數據授權政策</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">數據收集範圍</h3>
                <p>我們收集的數據包括但不限於：瀏覽記錄、購買歷史、偏好設定、設備資訊等，以提供個人化的購物體驗。</p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">Cookie 使用</h3>
                <p>
                  本網站使用 Cookie
                  技術來改善用戶體驗，包括記住您的偏好設定、購物車內容和登入狀態。您可以在瀏覽器設定中管理 Cookie 偏好。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">數據分析</h3>
                <p>
                  我們可能使用匿名化的數據進行統計分析，以了解用戶行為模式和改善服務品質。這些分析不會涉及個人身份識別。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">第三方服務</h3>
                <p>
                  我們可能使用第三方服務（如支付處理商、物流公司）來完成交易。這些服務提供商均遵守相應的數據保護規範。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-amber-800 mb-3">數據保留期限</h3>
                <p>我們僅在必要期間保留您的數據，通常不超過法律要求的最長期限。過期數據將被安全刪除。</p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
