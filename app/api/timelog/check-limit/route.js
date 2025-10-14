import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma.js'
import { checkRateLimit } from '@/lib/rate-limit.js'

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
      return NextResponse.json(
        { status: 'error', message: '授權失敗，沒有存取令牌' },
        { status: 401 }
      )
    }

    // ========================================
    // 🆔 3. 取得用戶 ID
    // ========================================
    const userId = session.payload.userId

    // 查詢用戶的等級和當前活動記錄數量（使用 current_log_count 欄位，避免 COUNT 查詢）
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(userId) },
      select: {
        level: true,
        current_log_count: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: '用戶不存在' },
        { status: 404 }
      )
    }

    const { level, current_log_count } = user

    // ========================================
    // 🚦 4. 檢查速率限制
    // ========================================
    // 檢查 API 呼叫速率限制
    const rateLimitResult = checkRateLimit(userId, level, 'api')

    if (!rateLimitResult.allowed) {
      const resetTime = new Date(rateLimitResult.resetTime)
      console.log('🚦 check-limit API 速率限制觸發:', {
        userId,
        level,
        limit: rateLimitResult.limit,
        resetTime: resetTime.toISOString(),
      })

      return NextResponse.json(
        {
          status: 'error',
          message: `請求過於頻繁，請在 ${resetTime.toLocaleString()} 後再試`,
          resetTime: resetTime.toISOString(),
          limit: rateLimitResult.limit,
        },
        { status: 429 }
      )
    }

    console.log('✅ check-limit API 速率限制檢查通過:', {
      userId,
      level,
      remaining: rateLimitResult.remaining,
      limit: rateLimitResult.limit,
    })

    // ========================================
    // 📊 5. 根據用戶等級設定限制
    // ========================================
    let limit = 0
    let canSave = false

    if (level === 0) {
      // 未付費用戶：最多5筆活動（比3筆多一點，提升體驗）
      limit = 5
      canSave = current_log_count < limit
    } else if (level === 1) {
      // 已付費用戶：最多50筆活動（考慮成本控制）
      limit = 50
      canSave = current_log_count < limit
    } else {
      // 其他情況（level >= 2）：無限制
      limit = -1 // -1 表示無限制
      canSave = true
    }

    return NextResponse.json({
      status: 'success',
      data: {
        userId: parseInt(userId),
        level,
        currentCount: parseInt(current_log_count),
        limit,
        canSave,
        message:
          level === 0
            ? `您目前有 ${current_log_count}/${limit} 筆活動記錄`
            : level === 1
              ? `您目前有 ${current_log_count}/${limit} 筆活動記錄`
              : '您可以使用完整功能',
        // 加入速率限制資訊
        rateLimit: {
          api: {
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            resetTime: rateLimitResult.resetTime,
          },
        },
      },
    })
  } catch (error) {
    console.error('檢查限制時發生錯誤:', error)
    return NextResponse.json(
      { status: 'error', message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
