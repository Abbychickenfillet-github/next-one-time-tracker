// 說明：處理金流串接的路由 (Line Pay v3)
import { NextResponse as res } from 'next/server'
// 導入服務層的類別
import { requestPayment } from '@/services/line-pay.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
// 導入 IP 白名單檢查
import { linePayIPMiddleware } from '@/lib/ip-whitelist.js'

// 處理金流串接的路由 GET /api/payment/line-pay/request
export async function GET(request) {
  // IP 白名單檢查（僅在生產環境啟用）
  if (process.env.NODE_ENV === 'production') {
    const ipCheckResult = linePayIPMiddleware(request)
    if (ipCheckResult) {
      return ipCheckResult // 返回 403 Forbidden
    }
  }

  // 取得查詢參數，與設定預設值
  const searchParams = request.nextUrl.searchParams
  const amount = Number(searchParams.get('amount')) || 0

  if (!amount) {
    return errorResponse(res, { message: '缺少金額' })
  }

  // 取得資料 (使用 Line Pay v3)
  console.log('🚀 [Line Pay v3] 開始處理付款請求，金額:', amount)
  const data = await requestPayment(amount)
  console.log('🔍 [Line Pay v3] requestPayment 回應:', data)

  // 如果是開發環境，顯示詳細資料
  if (isDev) console.log('🔧 [Line Pay v3] 開發環境詳細資料:', data)

  // API回應
  if (data.status === 'success') {
    console.log('✅ [Line Pay v3] 付款請求成功')
    return successResponse(res, data?.payload)
  } else {
    const error = { message: data?.message || '付款請求失敗' }
    console.error('❌ [Line Pay v3] 付款請求失敗:', error)
    return errorResponse(res, error)
  }
}
