import { NextResponse as res } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma.js'
import { successResponse, errorResponse } from '@/lib/utils.js'
import { checkRateLimit } from '@/lib/rate-limit.js'
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
    // 🚦 6. 檢查速率限制
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
      console.log('🚦 API 速率限制觸發:', {
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
        },
        { status: 429 }
      )
    }

    console.log('✅ API 速率限制檢查通過:', {
      userId,
      level: user.level,
      remaining: rateLimitResult.remaining,
      limit: rateLimitResult.limit,
    })

    // ========================================
    // 📊 7. 創建時間戳記錄並更新用戶的 current_log_count
    // ========================================
    // 解析本地時間字串為 Date 物件
    // 如果字串格式是 YYYY-MM-DDTHH:mm:ss（沒有時區），視為本地時間
    const parseLocalTime = (timeString) => {
      if (!timeString) return null
      // 如果包含 Z 或時區偏移，直接用 new Date() 解析
      if (timeString.includes('Z') || timeString.match(/[+-]\d{2}:\d{2}$/)) {
        return new Date(timeString)
      }
      // 否則視為本地時間字串，手動解析
      const [datePart, timePart] = timeString.split('T')
      if (!datePart || !timePart) return new Date(timeString)
      const [year, month, day] = datePart.split('-').map(Number)
      const [hours, minutes, seconds] = timePart.split(':').map(Number)
      // 使用 new Date() 構造函數形式（明確指定本地時間）
      return new Date(year, month - 1, day, hours, minutes, seconds || 0)
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        title: body.title,
        startTime: parseLocalTime(body.startTime),
        endTime: body.endTime ? parseLocalTime(body.endTime) : null,
        userId: userId,
        memo: body.memo || null, // 新增備註欄位支援
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
    // 🔢 8. 更新用戶的 current_log_count（新增一筆記錄 +1）
    // ========================================
    await prisma.user.update({
      where: { user_id: userId },
      data: {
        current_log_count: {
          increment: 1, // Prisma 的原子操作，避免併發問題
        },
      },
    })

    // ========================================
    // 📤 9. 回傳 API 回應
    // ========================================

    return successResponse(res, {
      id: timeLog.id,
      title: timeLog.title,
      startTime: timeLog.startTime,
      endTime: timeLog.endTime,
      userId: timeLog.userId,
      memo: timeLog.memo, // 回傳備註欄位
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
        memo: log.memo, // 在 GET 回應中也包含備註
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

    return successResponse(res, { message: '時間戳記錄已成功刪除' })
  } catch (error) {
    console.error('刪除時間戳記錄失敗:', error)
    const errorMsg = { message: '刪除時間戳記錄失敗' }
    return errorResponse(res, errorMsg)
  }
}
