// 說明：處理金流串接的路由
import { NextResponse } from 'next/server'
// 導入服務層的類別
import { confirmPayment } from '@/services/line-pay.service.js'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
// 導入 IP 白名單檢查 - 暫時註解掉
// import { linePayIPMiddleware } from '@/lib/ip-whitelist.js'
import prisma from '@/lib/prisma.js'

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
  const transactionId = searchParams.get('transactionId') || ''

  if (!transactionId) {
    return errorResponse(NextResponse, { message: '缺少交易編號' })
  }

  // 取得資料
  const data = await confirmPayment(transactionId)

  // 如果是開發環境，顯示部落格列表
  if (isDev) console.log(data)

  // API回應
  if (data.status === 'success') {
    // 更新資料庫中的訂單狀態
    try {
      const confirmData = data.payload || data.data
      const updatedOrder = await prisma.paymentOrder.update({
        where: { transactionId },
        data: {
          status: 'SUCCESS',
          returnCode: confirmData?.returnCode,
          returnMessage: confirmData?.returnMessage,
        },
      })
      console.log('💾 訂單狀態已更新為成功:', updatedOrder.id)
    } catch (dbError) {
      console.error('❌ 更新訂單狀態失敗:', dbError)
      // 不中斷流程，繼續返回成功回應
    }

    return successResponse(NextResponse, data?.payload)
  } else {
    // 更新資料庫中的訂單狀態為失敗
    try {
      const confirmData = data.payload || data.data
      await prisma.paymentOrder.update({
        where: { transactionId },
        data: {
          status: 'FAILED',
          returnCode: confirmData?.returnCode,
          returnMessage: confirmData?.returnMessage || data.message,
        },
      })
      console.log('💾 訂單狀態已更新為失敗:', transactionId)
    } catch (dbError) {
      console.error('❌ 更新訂單狀態失敗:', dbError)
    }

    const error = { message: data?.message }
    return errorResponse(NextResponse, error)
  }
}
