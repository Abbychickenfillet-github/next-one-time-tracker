// 說明：處理金流串接的路由 (Line Pay v3)
import prisma from '@/lib/prisma.js'
import { NextResponse as res } from 'next/server'
// 導入服務層的類別
import { requestPayment } from '@/services/line-pay.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
// 暫時註解掉 Prisma 導入以測試 API 路由
// import prisma from '@/lib/prisma.js'
// 導入 IP 白名單檢查 - 暫時註解掉
// import { linePayIPMiddleware } from '@/lib/ip-whitelist.js'

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
  // IP 白名單檢查（僅在生產環境啟用）- 暫時註解掉
  // if (process.env.NODE_ENV === 'production') {
  //   const ipCheckResult = linePayIPMiddleware(request)
  //   if (ipCheckResult) {
  //     return ipCheckResult // 返回 403 Forbidden
  //   }
  // }

  try {
    // 取得請求資料
    const body = await request.json()
    const { amount, orderId, currency = 'TWD', packages = [] } = body

    // 驗證必要參數
    if (!amount || !orderId) {
      return errorResponse(res, { message: '缺少必要參數：amount 和 orderId' })
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

    console.log('🔍 [Line Pay v3] 訂閱付款請求回應:', data)

    // 如果是開發環境，顯示詳細資料
    if (isDev) console.log('🔧 [Line Pay v3] 開發環境詳細資料:', data)

    // API回應
    if (data.status === 'success') {
      console.log('✅ [Line Pay v3] 訂閱付款請求成功')

      // 存儲訂單到資料庫
      try {
        const paymentOrder = await prisma.paymentOrder.create({
          data: {
            orderId,
            amount,
            currency,
            status: 'PENDING',
            packages: packages,
            redirectUrls: {
              confirmUrl: 'http://localhost:3001/line-pay/callback',
              cancelUrl: 'http://localhost:3001/line-pay/cancel',
            },
            paymentUrl: data.payload?.paymentUrl || data.data?.paymentUrl,
            transactionId:
              data.payload?.transactionId || data.data?.transactionId,
            paymentAccessToken:
              data.payload?.paymentAccessToken || data.data?.paymentAccessToken,
          },
        })
        console.log('💾 訂單已存儲到資料庫:', paymentOrder.id)
      } catch (dbError) {
        console.error('❌ 存儲訂單到資料庫失敗:', dbError)
        // 不中斷流程，繼續返回成功回應
      }

      return successResponse(res, data?.payload)
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
