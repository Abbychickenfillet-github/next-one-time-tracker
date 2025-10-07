import { NextResponse as res } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma.js'
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

// ========================================
// 📊 創建時間戳記錄 API: POST /api/timelog
// ========================================
// 功能：創建新的時間戳記錄
// 認證方式：透過 JWT Token 從 Cookie 中取得用戶身份
export async function POST(request) {
  try {
    // ========================================
    // 📥 1. 解析請求資料
    // ========================================
    const body = await request.json()
    if (isDev) {
      console.log('時間戳記錄請求資料:', {
        ...body,
        startTime: body.startTime
          ? new Date(body.startTime).toISOString()
          : '未提供',
        endTime: body.endTime ? new Date(body.endTime).toISOString() : '未提供',
      })
    }

    // ========================================
    // 🍪 2. 從 Cookie 中取得 JWT Token
    // ========================================
    const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
    console.log(
      'timelog API執行時，從 Cookie 取得的 ACCESS_TOKEN:',
      cookie ? '存在' : '不存在'
    )

    // ========================================
    // 🔓 3. 解密 JWT Token 取得用戶資訊
    // ========================================
    const session = await decrypt(cookie)
    console.log(
      'timelog API執行時，解密後的 session:',
      session ? '成功' : '失敗'
    )

    // ========================================
    // ✅ 4. 驗證用戶身份
    // ========================================
    if (!session?.payload?.userId) {
      console.log('timelog API執行時，認證失敗：沒有有效的用戶 ID')
      const error = { message: '授權失敗，沒有存取令牌' }
      return errorResponse(res, error)
    }

    // ========================================
    // 🆔 5. 取得用戶 ID
    // ========================================
    const userId = session?.payload?.userId
    console.log('timelog API執行時，取得用戶 ID:', userId)

    // ========================================
    // 📊 6. 創建時間戳記錄
    // ========================================
    const timeLog = await prisma.timeLog.create({
      data: {
        title: body.title,
        startTime: new Date(body.startTime),
        endTime: body.endTime ? new Date(body.endTime) : null,
        userId: userId,
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

    // ========================================
    // 📤 7. 回傳 API 回應
    // ========================================
    if (isDev) {
      console.log('✅ 時間戳記錄創建成功:', {
        ID: timeLog.id,
        標題: timeLog.title,
        開始時間: timeLog.startTime,
        結束時間: timeLog.endTime,
        用戶ID: timeLog.userId,
      })
    }

    return successResponse(res, {
      id: timeLog.id,
      title: timeLog.title,
      startTime: timeLog.startTime,
      endTime: timeLog.endTime,
      userId: timeLog.userId,
      user: timeLog.user,
    })
  } catch (error) {
    console.error('創建時間戳記錄失敗:', error)
    const errorMsg = { message: '創建時間戳記錄失敗' }
    return errorResponse(res, errorMsg)
  }
}

// ========================================
// 📊 獲取時間戳記錄 API: GET /api/timelog
// ========================================
// 功能：獲取時間戳記錄列表
export async function GET() {
  try {
    // ========================================
    // 🍪 1. 從 Cookie 中取得 JWT Token
    // ========================================
    const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
    const session = await decrypt(cookie)

    // ========================================
    // ✅ 2. 驗證用戶身份
    // ========================================
    if (!session?.payload?.userId) {
      const error = { message: '授權失敗，沒有存取令牌' }
      return errorResponse(res, error)
    }

    // ========================================
    // 🆔 3. 取得用戶 ID
    // ========================================
    const userId = session?.payload?.userId

    // ========================================
    // 📊 4. 查詢時間戳記錄
    // ========================================
    const timeLogs = await prisma.timeLog.findMany({
      where: {
        userId: userId,
      },
      include: {
        steps: true,
        user: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    })

    // ========================================
    // 📤 5. 回傳 API 回應
    // ========================================
    return successResponse(res, {
      timeLogs: timeLogs.map((log) => ({
        id: log.id,
        title: log.title,
        startTime: log.startTime,
        endTime: log.endTime,
        duration: log.endTime
          ? Math.round(
              ((new Date(log.endTime) - new Date(log.startTime)) /
                (1000 * 60 * 60)) *
                100
            ) / 100
          : null,
        steps: log.steps,
        user: log.user,
      })),
    })
  } catch (error) {
    console.error('獲取時間戳記錄失敗:', error)
    const errorMsg = { message: '獲取時間戳記錄失敗' }
    return errorResponse(res, errorMsg)
  }
}
// 幫我寫一個刪除的API
export async function DELETE(request, { params }) {
  try {
    const { id } = await params.id
    const timeLog = await prisma.timeLog.delete({
      where: { id },
    })

    if (isDev) {
      console.log('✅ 時間戳記錄已成功刪除:', timeLog)
    }

    return successResponse(res, { message: '時間戳記錄已成功刪除' })
  } catch (error) {
    console.error('刪除時間戳記錄失敗:', error)
    const errorMsg = { message: '刪除時間戳記錄失敗' }
    return errorResponse(res, errorMsg)
  }
}
