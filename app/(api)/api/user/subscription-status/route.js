// 說明：獲取用戶訂閱狀態的 API
import { NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/utils.js'
import prisma from '@/lib/prisma.js'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // 從 JWT session 取得 userId
    const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
    if (!cookie) {
      return errorResponse(NextResponse, { message: '未登入' }, 401)
    }

    const session = await decrypt(cookie)
    const userId = session?.payload?.userId

    console.log('🔑 JWT Session:', session)
    console.log('👤 User ID from JWT:', userId)

    if (!userId) {
      return errorResponse(NextResponse, { message: '無效的登入狀態' }, 401)
    }

    // 查詢用戶的當前有效訂閱
    console.log('🔍 查詢條件:', {
      userId,
      status: 'SUCCESS',
      isCurrent: true,
      dueAt: { gt: new Date() },
    })

    const currentSubscription = await prisma.paymentOrder.findFirst({
      where: {
        userId: userId,
        status: 'SUCCESS',
        isCurrent: true,
        dueAt: {
          gt: new Date(), // 到期時間大於現在時間。是 Prisma ORM 的查詢語法， gt = greater than (大於)
        },
      },
      orderBy: {
        dueAt: 'desc',
      },
    })

    console.log('📋 查詢結果:', currentSubscription)
    // 這邊應該先查詢用戶是否已經有訂閱，如果沒有則返回尚未訂閱。我要取出訂閱者的各項欄位資料，包括訂閱編號、付款時間、到期時間、剩餘天數、金額、幣別。
    if (currentSubscription) {
      // 計算剩餘天數
      const now = new Date()
      const dueAt = new Date(currentSubscription.dueAt)
      const daysLeft = Math.ceil((dueAt - now) / (1000 * 60 * 60 * 24))
      // 以下為要回傳到前端的資料。若沒有寫則會沒有回傳
      return successResponse(NextResponse, {
        isActive: true,
        isCurrent: currentSubscription.isCurrent,
        orderId: currentSubscription.orderId,
        paidAt: currentSubscription.paidAt,
        dueAt: currentSubscription.dueAt,
        daysLeft: daysLeft,
        amount: currentSubscription.amount,
        currency: currentSubscription.currency,
      })
    } else {
      // 查詢是否有過期的訂閱
      const expiredSubscription = await prisma.paymentOrder.findFirst({
        where: {
          userId: userId,
          status: 'SUCCESS',
          dueAt: {
            lte: new Date(), // 到期時間小於等於現在時間
          },
        },
        orderBy: {
          dueAt: 'desc',
        },
      })

      if (expiredSubscription) {
        return successResponse(NextResponse, {
          isActive: false,
          isCurrent: expiredSubscription.isCurrent,
          orderId: expiredSubscription.orderId,
          paidAt: expiredSubscription.paidAt,
          dueAt: expiredSubscription.dueAt,
          daysLeft: 0,
          message: '訂閱已過期',
        })
      } else {
        return successResponse(NextResponse, {
          isActive: false,
          message: '尚未訂閱',
        })
      }
    }
  } catch (error) {
    console.error('獲取訂閱狀態失敗:', error)
    return errorResponse(NextResponse, { message: '伺服器內部錯誤' }, 500)
  }
}
