// ========================================
// 🔍 認證狀態檢查 API 路由 (Authentication Check API Route)
// ========================================
// 用途：檢查用戶當前的認證狀態，不進行登入操作
// 功能：
// 1. 從 cookie 中讀取 ACCESS_TOKEN
// 2. 解密 JWT token 獲取用戶 ID
// 3. 根據用戶 ID 查詢完整的用戶資料和收藏清單
// 4. 返回用戶資料給前端
//
// 與其他認證路由的關係：
// - /api/auth/local/login: 處理登入，建立認證狀態
// - /api/auth/local/logout: 處理登出，清除認證狀態
// - /api/auth/google/login: Google OAuth 登入
// - /api/auth/line/login: LINE OAuth 登入
//
// 使用場景：
// - 頁面載入時檢查用戶是否已登入
// - 前端 useAuthGet() hook 會調用此 API
// - 受保護路由的認證檢查
// ========================================

// 導入回應函式
import { successResponse, errorResponse } from '@/lib/utils.js'
import { NextResponse as res } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import { getUserById, getFavoritesByUserId } from '@/services/user.service'

// 認證狀態檢查 - 驗證 token 有效性
export async function GET() {
  try {
    // 從 cookie 中解密session
    const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
    const session = await decrypt(cookie)

    if (!session?.payload?.userId) {
      const error = { message: '授權失敗，沒有存取令牌' }
      return errorResponse(res, error)
    }

    // 取得使用者id，從session.payload.userId取得(透過JWT解碼)
    const userId = session?.payload?.userId

    // 取得會員所有資料，包含profile
    const data1 = await getUserById(userId)

    if (!data1?.payload?.user) {
      return errorResponse(res, { message: '找不到使用者或使用者已被停用' })
    }

    // 取得會員收藏清單
    const data2 = await getFavoritesByUserId(userId)

    return successResponse(res, {
      user: data1?.payload?.user,
      favorites: data2?.payload?.favorites,
    })
  } catch (error) {
    console.error('Token 驗證失敗:', error)
    return errorResponse(res, { message: 'Token 驗證失敗' })
  }
}
