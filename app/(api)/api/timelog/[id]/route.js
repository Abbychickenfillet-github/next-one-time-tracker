import { NextResponse as res } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma.js'
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

// ========================================
// 🗑️ 刪除時間戳記錄 API: DELETE /api/timelog/[id]
// ========================================
export async function DELETE(request, { params }) {
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
    // 🆔 3. 取得用戶 ID 和記錄 ID
    // ========================================
    const userId = session?.payload?.userId
    const { id } = await params

    // ========================================
    // 🔍 4. 檢查記錄是否存在且屬於該用戶
    // ========================================
    const existingLog = await prisma.timeLog.findFirst({
      where: {
        id: id, // UUID 已經是字串，不需要轉換
        userId: userId,
      },
    })

    if (!existingLog) {
      const error = { message: '時間戳記錄不存在或無權限刪除' }
      return errorResponse(res, error)
    }

    // ========================================
    // 🗑️ 5. 刪除時間戳記錄
    // ========================================
    const timeLog = await prisma.timeLog.delete({
      where: { id: id }, // UUID 已經是字串，不需要轉換
    })

    // ========================================
    // 🔢 6. 更新用戶的 current_log_count（刪除一筆記錄 -1）
    // ========================================
    await prisma.user.update({
      where: { user_id: userId },
      data: {
        current_log_count: {
          decrement: 1, // Prisma 的原子操作，避免併發問題
        },
      },
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
