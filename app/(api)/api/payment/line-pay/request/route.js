// 說明：處理金流串接的路由 (Line Pay v3)
import { NextResponse as res } from 'next/server'
// 導入服務層的類別
import { requestPayment } from '@/services/line-pay.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
// 導入 JWT 認證
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'

// 處理金流串接的路由 GET /api/payment/line-pay/request
export async function GET(request) {
  // IP 白名單檢查（僅在生產環境啟用）- 暫時註解掉
  // if (process.env.NODE_ENV === 'production') {
  //   const ipCheckResult = linePayIPMiddleware(request)
  //   if (ipCheckResult) {
  //     return ipCheckResult // 返回 403 Forbidden
  //   }
  // }

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

// 處理訂閱服務的 POST 請求
export async function POST(request) {
  //前端傳來的東西會這樣放

  try {
    // 取得請求資料
    const body = await request.json()
    const { amount, orderId, currency = 'TWD', packages = [] } = body

    // 驗證必要參數
    if (!amount || !orderId) {
      return errorResponse(res, { message: '缺少必要參數：amount 和 orderId' })
    }

    // 從 JWT session 取得 userId
    const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
    console.log('🍪 從 Cookie 取得的 ACCESS_TOKEN:', cookie ? '存在' : '不存在')

    const session = await decrypt(cookie)
    console.log('🔐 解密後的 session:', session ? '成功' : '失敗')
    console.log('🔐 session 詳細內容:', session)

    const userId = session?.payload?.userId
    console.log('👤 取得用戶 ID:', userId)

    if (!userId) {
      console.error('❌ 未登入或授權失敗')
      return errorResponse(res, { message: '未登入或授權失敗' })
    }

    console.log('🚀 [Line Pay v3] 開始處理訂閱付款請求:', {
      amount,
      orderId,
      currency,
      packagesCount: packages.length,
    })

    // 使用現有的服務層處理付款請求
    const data = await requestPayment(amount, {
      orderId,
      currency,
      packages,
    })
    console.log('data', data)
    console.log('')
    console.log('🔍 [Line Pay v3] 訂閱付款請求回應:', data)

    // 如果是開發環境，顯示詳細資料
    if (isDev) console.log('🔧 [Line Pay v3] 開發環境詳細資料:', data)

    // API回應
    if (data.status === 'success') {
      console.log('✅ [Line Pay v3] 訂閱付款請求成功')
      // 我應該要印出來的是data還是response？
      // 印出完整的後端回應給前端
      console.log('📤 後端回應給前端的完整資料:', {
        status: 'success',
        payload: data?.payload,
        data: data?.data,
        paymentUrl: data?.payload?.paymentUrl || data?.data?.paymentUrl,
        transactionId:
          data?.payload?.transactionId || data?.data?.transactionId,
      })

      // 不在此時存儲訂單到資料庫，應該等到 callback 確認付款後才存儲
      // 只回傳付款 URL 給前端進行跳轉

      return successResponse(res, {
        paymentUrl: data?.payload?.paymentUrl || data?.data?.paymentUrl,
        transactionId: String(
          data?.payload?.transactionId || data?.data?.transactionId
        ), // 轉為字串避免 Prisma 錯誤
        orderId,
        status: 'PENDING',
      })
    } else {
      const error = { message: data?.message || '訂閱付款請求失敗' }
      console.error('❌ [Line Pay v3] 訂閱付款請求失敗:', error)
      return errorResponse(res, error)
    }
  } catch (error) {
    console.error('❌ [Line Pay v3] 訂閱付款請求異常:', error)
    return errorResponse(res, { message: '伺服器內部錯誤' })
  }
}
