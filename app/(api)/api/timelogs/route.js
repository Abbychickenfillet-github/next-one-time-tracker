import { NextResponse as res } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma.js'
import { successResponse, errorResponse } from '@/lib/utils.js'
import { checkRateLimit } from '@/lib/rate-limit.js'

// ========================================
// 📊 獲取用戶時間戳記錄 API: GET /api/timelogs
// ========================================
// 功能：獲取當前登入用戶的時間戳記錄
// 認證方式：透過 JWT Token 從 Cookie 中取得用戶身份
export async function GET() {
  try {
    // ========================================
    // 🍪 1. 從 Cookie 中取得 JWT Token
    // ========================================
    const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
    console.log('從 Cookie 取得的 ACCESS_TOKEN:', cookie ? '存在' : '不存在')

    // ========================================
    // 🔓 2. 解密 JWT Token 取得用戶資訊
    // ========================================
    const session = await decrypt(cookie)
    console.log('解密後的 session:', session ? '成功' : '失敗')
    console.log('🔍 session 完整結構:', JSON.stringify(session, null, 2))
    console.log('🔍 session?.payload:', session?.payload)
    console.log('🔍 session?.payload?.userId:', session?.payload?.userId)

    // 額外的除錯資訊
    if (session?.payload) {
      console.log('🔍 payload 類型:', typeof session.payload)
      console.log('🔍 payload 鍵值:', Object.keys(session.payload))
      console.log('🔍 userId 值:', session.payload.userId)
      console.log('🔍 userId 類型:', typeof session.payload.userId)
    }

    // ========================================
    // ✅ 3. 驗證用戶身份
    // ========================================
    if (!session?.payload?.userId) {
      console.log('❌ 認證失敗：沒有有效的用戶 ID')
      const error = { message: '授權失敗，沒有存取令牌' }
      return errorResponse(res, error)
    }

    // ========================================
    // 🆔 4. 取得用戶 ID (注意：JWT 使用 userId，資料庫使用 user_id)
    // ========================================
    const userId = session?.payload?.userId
    console.log('取得用戶 ID:', userId)

    // ========================================
    // 🚦 5. 檢查速率限制
    // ========================================
    // 先查詢用戶等級
    const user = await prisma.user.findUnique({
      where: { user_id: userId }, // UUID 已經是字串，不需要轉換
      select: { level: true },
    })

    if (!user) {
      const error = { message: '用戶不存在' }
      return errorResponse(res, error)
    }

    // 檢查 API 呼叫速率限制
    const rateLimitResult = checkRateLimit(userId, user.level, 'api')

    if (!rateLimitResult.allowed) {
      const resetTime = new Date(rateLimitResult.resetTime)
      console.log('🚦 timelogs API 速率限制觸發:', {
        userId,
        level: user.level,
        limit: rateLimitResult.limit,
        resetTime: resetTime.toISOString(),
      })

      return res.json(
        {
          status: 'error',
          message: `請求過於頻繁，請在 ${resetTime.toLocaleString()} 後再試`,
          resetTime: resetTime.toISOString(),
          limit: rateLimitResult.limit,
          errorType: 'rate_limit', // 標記為速率限制錯誤
        },
        { status: 429 }
      )
    }

    console.log('✅ timelogs API 速率限制檢查通過:', {
      userId,
      level: user.level,
      remaining: rateLimitResult.remaining,
      limit: rateLimitResult.limit,
    })

    // ========================================
    // 📊 6. 查詢用戶的時間戳記錄
    // ========================================
    console.log('🔍 準備查詢資料庫，userId:', userId, '類型:', typeof userId)

    const timeLogs = await prisma.timeLog.findMany({
      where: {
        userId: userId, // userId 對應資料庫的 user_id 欄位
      },
      include: {
        steps: true, // 包含相關的步驟
        user: {
          select: {
            user_id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc', // 按開始時間降序排列
      },
    })

    console.log('🔍 查詢結果:', timeLogs.length, '筆記錄')
    if (timeLogs.length > 0) {
      console.log('🔍 第一筆記錄:', JSON.stringify(timeLogs[0], null, 2))
    }

    // ========================================
    // 📈 7. 計算統計數據
    // ========================================
    const totalLogs = timeLogs.length
    const totalDuration = timeLogs.reduce((total, log) => {
      if (log.endTime) {
        const duration = new Date(log.endTime) - new Date(log.startTime)
        return total + duration
      }
      return total
    }, 0)

    // 計算今日記錄
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayLogs = timeLogs.filter((log) => new Date(log.startTime) >= today)

    // 計算本週記錄
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weekLogs = timeLogs.filter(
      (log) => new Date(log.startTime) >= weekStart
    )

    // ========================================
    // 📤 8. 回傳 API 回應給前端
    // ========================================
    const responseData = {
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
          : null, // 小時為單位
        steps: log.steps.map((step) => ({
          id: step.id,
          title: step.title,
          description: step.description,
          startTime: step.startTime,
          endTime: step.endTime,
        })),
        user: log.user,
      })),
      statistics: {
        totalLogs,
        totalDuration:
          Math.round((totalDuration / (1000 * 60 * 60)) * 100) / 100, // 轉換為小時
        todayLogs: todayLogs.length,
        weekLogs: weekLogs.length,
        efficiency:
          totalLogs > 0 ? Math.min(95, Math.round((totalLogs / 10) * 100)) : 0, // 簡單的效率計算
      },
    }

    return successResponse(res, responseData)
  } catch (error) {
    console.error('獲取時間戳記錄失敗:', error)
    const errorMsg = { message: '獲取時間戳記錄失敗' }
    return errorResponse(res, errorMsg)
  }
}
