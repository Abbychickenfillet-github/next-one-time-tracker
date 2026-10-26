import { NextResponse as res } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma.js'
import { successResponse, errorResponse } from '@/lib/utils.js'

// ========================================
// 📊 獲取使用者活動名稱歷史 API: GET /api/timelog/titles
// ========================================
// 功能：獲取使用者曾經輸入過的活動名稱，用於下拉選單
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
    // 📊 4. 查詢使用者活動名稱歷史
    // ========================================
    const titles = await prisma.timeLog.findMany({
      where: {
        userId: userId,
      },
      select: {
        title: true,
        id: true,
        startTime: true,
        memo: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    })

    // ========================================
    // 🔄 5. 去重並統計使用次數
    // ========================================
    const titleMap = new Map()

    titles.forEach((log) => {
      const title = log.title
      if (titleMap.has(title)) {
        const existing = titleMap.get(title)
        existing.count += 1
        existing.lastUsed = new Date(log.startTime)
        existing.lastMemo = log.memo
      } else {
        titleMap.set(title, {
          title: title,
          count: 1,
          lastUsed: new Date(log.startTime),
          lastMemo: log.memo,
          firstId: log.id,
        })
      }
    })

    // 轉換為陣列並按使用次數排序
    const uniqueTitles = Array.from(titleMap.values()).sort(
      (a, b) => b.count - a.count
    ) // 按使用次數降序排列

    // ========================================
    // 📤 6. 回傳 API 回應
    // ========================================

    return successResponse(res, {
      titles: uniqueTitles,
      total: uniqueTitles.length,
    })
  } catch (error) {
    console.error('獲取活動名稱歷史失敗:', error)
    const errorMsg = { message: '獲取活動名稱歷史失敗' }
    return errorResponse(res, errorMsg)
  }
}
