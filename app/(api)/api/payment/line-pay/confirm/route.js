// 說明：處理金流串接的路由
import { NextResponse } from 'next/server'
// 導入服務層的類別
import { confirmPayment } from '@/services/line-pay.service.js'
// 導入回應函式
import { successResponse, errorResponse } from '@/lib/utils.js'
import prisma from '@/lib/prisma.js'
// 導入 JWT 認證
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'

export async function GET(request) {
  // 取得查詢參數，與設定預設值
  const searchParams = request.nextUrl.searchParams
  const transactionId = searchParams.get('transactionId') || ''

  if (!transactionId) {
    return errorResponse(NextResponse, { message: '缺少交易編號' })
  }

  // 嘗試從 session 取得 userId 和訂單資料
  let userId = null
  let pendingOrderData = null

  try {
    const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
    if (cookie) {
      const session = await decrypt(cookie)
      userId = session?.payload?.userId
      console.log('👤 從 session 取得用戶 ID:', userId)
      console.log('🔍 完整 session 內容:', session)
    } else {
      console.log('⚠️ 沒有找到 ACCESS_TOKEN cookie')
    }
  } catch (error) {
    console.log('⚠️ 無法取得用戶 session，將建立匿名訂單:', error.message)
  }

  // 嘗試從 session 取得待處理的訂單資料
  try {
    const pendingOrderCookie = (await cookies()).get('PENDING_ORDER')?.value
    if (pendingOrderCookie) {
      const pendingOrderSession = await decrypt(pendingOrderCookie)
      pendingOrderData = pendingOrderSession?.payload?.orderData
      console.log('📋 從 session 取得待處理訂單資料:', pendingOrderData)

      // 清除已使用的 session cookie
      const cookieStore = await cookies()
      cookieStore.delete('PENDING_ORDER')
      console.log('🗑️ 已清除 PENDING_ORDER session cookie')
    } else {
      console.log('⚠️ 沒有找到 PENDING_ORDER cookie')
    }
  } catch (error) {
    console.log('⚠️ 無法取得待處理訂單 session:', error.message)
  }

  // 取得資料
  const data = await confirmPayment(transactionId)

  // API回應
  if (data.status === 'success') {
    // 付款成功，現在建立訂單記錄並處理訂閱
    try {
      // 先查詢是否已經有這個 transactionId 的記錄
      const existingOrder = await prisma.paymentOrder.findUnique({
        where: { transactionId },
        include: {
          user: {
            select: {
              user_id: true,
              email: true,
            },
          },
        },
      })

      let updatedOrder

      // 使用台北時區的時間（移到外層作用域）
      const now = new Date()
      const dueAt = new Date(now)
      dueAt.setMonth(dueAt.getMonth() + 1)

      // 確保時間是台北時區
      const taipeiNow = new Date(
        now.toLocaleString('en-US', { timeZone: 'Asia/Taipei' })
      )
      const taipeiDueAt = new Date(
        dueAt.toLocaleString('en-US', { timeZone: 'Asia/Taipei' })
      )

      if (existingOrder) {
        // 如果記錄已存在，更新狀態為成功
        console.log('✅ 找到已存在的訂單記錄:', existingOrder.id)
        console.log('🔄 更新訂單狀態為成功...')

        updatedOrder = await prisma.paymentOrder.update({
          where: { id: existingOrder.id },
          data: {
            status: 'SUCCESS',
            isCurrent: true,
            subscriptionStatus: 'ACTIVE',
            paidAt: taipeiNow,
            dueAt: taipeiDueAt,
            transactionId: transactionId,
          },
          include: {
            user: {
              select: {
                user_id: true,
                email: true,
              },
            },
          },
        })

        console.log('✅ 訂單狀態更新成功:', updatedOrder.id)
      } else if (pendingOrderData) {
        // 如果沒有現有記錄但有 session 資料，使用 session 資料建立記錄
        console.log('📝 使用 session 中的訂單資料建立新記錄')

        updatedOrder = await prisma.paymentOrder.create({
          data: {
            orderId: pendingOrderData.orderId,
            userId: pendingOrderData.userId,
            amount: pendingOrderData.amount,
            currency: pendingOrderData.currency,
            status: 'SUCCESS',
            transactionId,
            packages: pendingOrderData.packages,
            redirectUrls: pendingOrderData.redirectUrls,
            paidAt: taipeiNow,
            dueAt: taipeiDueAt,
            subscriptionStatus: 'ACTIVE',
            isCurrent: true,
          },
          include: {
            user: {
              select: {
                user_id: true,
                email: true,
              },
            },
          },
        })

        console.log('✅ 使用 session 資料建立訂單成功:', updatedOrder.id)
      } else {
        // 如果都沒有，建立新記錄（使用 LINE Pay 回應的資料）
        console.log('📝 建立新的付款成功記錄:', transactionId)

        console.log(
          '🕐 付款時間 (台北時區):',
          taipeiNow.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
        )
        console.log(
          '🕐 到期時間 (台北時區):',
          taipeiDueAt.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
        )

        updatedOrder = await prisma.paymentOrder.create({
          data: {
            orderId: `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            userId: userId,
            amount: data.payload?.info?.packages?.[0]?.amount || 99,
            currency: 'TWD',
            status: 'SUCCESS',
            transactionId,
            packages: data.payload?.info?.packages || [],
            redirectUrls: {
              confirmUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/line-pay/confirm`,
              cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/line-pay/cancel`,
            },
            paidAt: taipeiNow,
            dueAt: taipeiDueAt,
            subscriptionStatus: 'ACTIVE',
            isCurrent: true,
          },
          include: {
            user: {
              select: {
                user_id: true,
                email: true,
              },
            },
          },
        })

        console.log('✅ 建立新訂單成功:', updatedOrder.id)
      }

      console.log('💾 訂單狀態已更新為成功序號:', updatedOrder.id)

      // 如果訂單有關聯用戶，更新用戶的付費狀態
      if (updatedOrder.userId) {
        await prisma.user.update({
          where: { user_id: updatedOrder.userId },
          data: {
            paid: true,
            paid_date: taipeiNow,
            due_date: taipeiDueAt,
            level: 1, // 設為付費用戶
          },
        })

        // 注意：不應該強制將其他訂單設為過期
        // 讓 due_at 時間自然到期，由查詢邏輯自動處理
        console.log('ℹ️ 其他訂單將根據 due_at 時間自然到期，不強制設定為過期')

        console.log('✅ 用戶付費狀態已更新:', updatedOrder.user?.email)
      }
    } catch (dbError) {
      console.error('❌ 更新訂單狀態失敗:', dbError)
      console.error('❌ 錯誤詳情:', {
        message: dbError.message,
        code: dbError.code,
        transactionId,
      })
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
