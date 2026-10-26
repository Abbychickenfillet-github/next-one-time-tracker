import { NextResponse as res } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma.js'
import { successResponse, errorResponse } from '@/lib/utils.js'

// ========================================
// 📊 創建步驟記錄 API: POST /api/step
// ========================================
// 功能：創建新的步驟記錄
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
    console.log('從 Cookie 取得的 ACCESS_TOKEN:', cookie ? '存在' : '不存在')

    // ========================================
    // 🔓 3. 解密 JWT Token 取得用戶資訊
    // ========================================
    const session = await decrypt(cookie)
    console.log('解密後的 session:', session ? '成功' : '失敗')

    // ========================================
    // ✅ 4. 驗證用戶身份
    // ========================================
    if (!session?.payload?.userId) {
      console.log('❌ 認證失敗：沒有有效的用戶 ID')
      const error = { message: '授權失敗，沒有存取令牌' }
      return errorResponse(res, error)
    }

    // ========================================
    // 🆔 5. 取得用戶 ID
    // ========================================
    const userId = session?.payload?.userId
    console.log('取得用戶 ID:', userId)

    // ========================================
    // 📊 6. 驗證 TimeLog 是否屬於當前用戶
    // ========================================
    const timeLog = await prisma.timeLog.findFirst({
      where: {
        id: body.timeLogId,
        userId: userId,
      },
    })

    if (!timeLog) {
      console.log('❌ TimeLog 不存在或不屬於當前用戶')
      const error = { message: '時間戳記錄不存在或無權限' }
      return errorResponse(res, error)
    }

    // ========================================
    // 📊 7. 創建步驟記錄
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

    const step = await prisma.step.create({
      data: {
        timeLogId: body.timeLogId,
        title: body.title,
        description: body.description,
        startTime: parseLocalTime(body.startTime),
        endTime: body.endTime ? parseLocalTime(body.endTime) : null,
      },
      include: {
        timeLog: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
      },
    })

    // ========================================
    // 📤 8. 回傳 API 回應
    // ========================================

    return successResponse(res, {
      id: step.id,
      timeLogId: step.timeLogId,
      title: step.title,
      description: step.description,
      startTime: step.startTime,
      endTime: step.endTime,
      timeLog: step.timeLog,
    })
  } catch (error) {
    console.error('創建步驟記錄失敗:', error)
    const errorMsg = { message: '創建步驟記錄失敗' }
    return errorResponse(res, errorMsg)
  }
}

// ========================================
// 📊 獲取步驟記錄 API: GET /api/step
// ========================================
// 功能：獲取步驟記錄列表
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
    // 📊 4. 查詢步驟記錄
    // ========================================
    const steps = await prisma.step.findMany({
      where: {
        timeLog: {
          userId: userId,
        },
      },
      include: {
        timeLog: {
          select: {
            id: true,
            title: true,
            userId: true,
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
      steps: steps.map((step) => ({
        id: step.id,
        timeLogId: step.timeLogId,
        title: step.title,
        description: step.description,
        startTime: step.startTime,
        endTime: step.endTime,
        duration: step.endTime
          ? Math.round(
              ((new Date(step.endTime) - new Date(step.startTime)) /
                (1000 * 60 * 60)) *
                100
            ) / 100
          : null,
        timeLog: step.timeLog,
      })),
    })
  } catch (error) {
    console.error('獲取步驟記錄失敗:', error)
    const errorMsg = { message: '獲取步驟記錄失敗' }
    return errorResponse(res, errorMsg)
  }
}
