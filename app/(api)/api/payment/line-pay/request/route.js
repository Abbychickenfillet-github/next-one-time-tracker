// 說明：處理金流串接的路由 (Line Pay v3)
import { NextResponse as res } from 'next/server'
// 導入服務層的類別
import { requestPayment } from '@/services/line-pay.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
// 導入 JWT 認證
import { decrypt, encrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
// 導入 Prisma。使LINE Pay 請求階段就建立 PaymentOrder 記錄
import prisma from '@/lib/prisma.js'

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
    return errorResponse(res, { message: '缺少金額' }) //金額很重要。勢必要參數
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

    // 檢查用戶是否已經有有效的付費訂閱
    try {
      const currentSubscription = await prisma.paymentOrder.findFirst({
        where: {
          userId: userId,
          status: 'SUCCESS',
          subscriptionStatus: 'ACTIVE',
          isCurrent: true,
          dueAt: {
            gt: new Date(), // 到期時間大於現在時間
          },
        },
        orderBy: {
          dueAt: 'desc',
        },
      })

      if (currentSubscription) {
        console.log('⚠️ 用戶已有有效訂閱:', {
          userId,
          orderId: currentSubscription.orderId,
          dueAt: currentSubscription.dueAt,
          daysLeft: Math.ceil(
            (currentSubscription.dueAt - new Date()) / (1000 * 60 * 60 * 24)
          ),
        })

        return errorResponse(res, {
          message: `您已有有效訂閱，到期時間：${currentSubscription.dueAt.toLocaleDateString('zh-TW')}，無法重複付款`,
        })
      }
    } catch (subscriptionCheckError) {
      console.error('❌ 檢查用戶訂閱狀態失敗:', subscriptionCheckError)
      // 不中斷流程，繼續處理付款請求
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

      const transactionId = String(
        data?.payload?.transactionId || data?.data?.transactionId
      )

      // 印出完整的後端回應給前端
      console.log('📤 後端回應給前端的完整資料:', {
        status: 'success',
        payload: data?.payload,
        data: data?.data,
        paymentUrl: data?.payload?.paymentUrl || data?.data?.paymentUrl,
        transactionId,
      })

      // 將訂單資料存在 session 中，等付款成功後再寫入資料庫
      const orderData = {
        orderId,
        userId,
        amount,
        currency,
        packages,
        transactionId,
        redirectUrls: {
          confirmUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/line-pay/confirm`,
          cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/line-pay/cancel`,
        },
      }

      // 將訂單資料加密後存到 session
      const orderSession = await encrypt({
        orderData,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30分鐘後過期
      })

      // 設定 session cookie
      const cookieStore = await cookies()
      cookieStore.set('PENDING_ORDER', orderSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 60, // 30分鐘
        path: '/',
      })

      console.log('📝 訂單資料已暫存到 session，等待付款確認:', orderData)

      return successResponse(res, {
        paymentUrl: data?.payload?.paymentUrl || data?.data?.paymentUrl,
        transactionId,
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
