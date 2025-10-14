// 說明：處理金流串接的路由
import { NextResponse } from 'next/server'
// 導入服務層的類別
import { confirmPayment } from '@/services/line-pay.service.js'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
import prisma from '@/lib/prisma.js'

export async function GET(request) {
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
    // 更新資料庫中的訂單狀態並處理訂閱
    try {
      const now = new Date()

      // 計算到期時間（下個月同一天）
      const dueAt = new Date(now)
      dueAt.setMonth(dueAt.getMonth() + 1)

      const updatedOrder = await prisma.paymentOrder.update({
        where: { transactionId },
        data: {
          status: 'SUCCESS',
          paidAt: now,
          dueAt: dueAt,
          subscriptionStatus: 'ACTIVE',
          isCurrent: true,
        },
        include: {
          // include: {...} 是 Prisma 查詢時一併載入關聯資料（這裡把關聯的 user 一起選回，且只挑 user_id、email）。
          user: {
            select: {
              user_id: true,
              email: true,
            },
          },
        },
      })

      console.log('💾 訂單狀態已更新為成功:', updatedOrder.id)

      // 如果訂單有關聯用戶，更新用戶的付費狀態
      if (updatedOrder.userId) {
        await prisma.user.update({
          where: { user_id: updatedOrder.userId },
          data: {
            paid: true,
            paid_date: now,
            due_date: dueAt,
            level: 1, // 設為付費用戶
          },
        })

        // 將該用戶的其他訂單設為非當前訂閱
        await prisma.paymentOrder.updateMany({
          where: {
            userId: updatedOrder.userId,
            transactionId: { not: transactionId },
            isCurrent: true,
          },
          data: {
            isCurrent: false,
            subscriptionStatus: 'EXPIRED',
          },
        })

        console.log('✅ 用戶付費狀態已更新:', updatedOrder.user?.email)
      }
    } catch (dbError) {
      console.error('❌ 更新訂單狀態失敗:', dbError)
      // 不中斷流程，繼續返回成功回應
    }

    return successResponse(NextResponse, data?.payload)
  } else {
    // 更新資料庫中的訂單狀態為失敗
    try {
      await prisma.paymentOrder.update({
        where: { transactionId },
        data: {
          status: 'FAILED',
          subscriptionStatus: 'CANCELLED',
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
