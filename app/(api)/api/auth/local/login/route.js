// ========================================
// 🔐 本地登入 API 路由 (Local Login API Route)
// ========================================
// 用途：處理用戶的本地登入請求（帳號密碼登入）
// 功能：
// 1. 接收前端傳來的 email 和 password
// 2. 透過 auth.service 驗證用戶憑證
// 3. 登入成功後建立 JWT session 並設置 ACCESS_TOKEN cookie
// 4. 返回用戶資料給前端
// 
// 與其他認證路由的關係：
// - /api/auth/check: 檢查現有認證狀態，不進行登入
// - /api/auth/local/logout: 處理登出，清除認證狀態
// - /api/auth/google/login: Google OAuth 登入
// - /api/auth/line/login: LINE OAuth 登入
// ========================================

import { NextResponse as res } from 'next/server'
import { cookies } from 'next/headers'

// 導入服務層的類別
import { login } from '@/services/auth.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
import { createSession } from '@/lib/jwt-session'

export async function POST(request) {
  // 取得新增的資料
  const body = await request.json()
  // 如果是開發環境，顯示新增的資料
  if (isDev) console.log(body)
  // 進行登入(本地端)，驗證帳號密碼
  const data = await login(body)
  // 如果是開發環境，顯示部落格列表
  if (isDev) console.log(data)

  // API回應
  if (data?.status === 'success') {
    const payload = { userId: data?.payload?.user?.user_id }
    
    // 開發環境調試
    if (isDev) {
      console.log('🔍 登入用戶數據:', data?.payload?.user)
      console.log('🔍 user_id:', data?.payload?.user?.user_id)
      console.log('🔍 最終 payload:', payload)
    }
    
    // 建立jwt session(Access Token) 並設定有效期限為3天
    await createSession(payload, '3d', 'ACCESS_TOKEN')
    
    // 開發環境調試
    if (isDev) {
      console.log('✅ 登入成功，已設置 ACCESS_TOKEN Cookie')
      console.log('📊 用戶 ID:', payload.userId)
      console.log('🔍 測試 JWT 創建是否成功...')
      
      // 測試 JWT 是否正確創建
      const testCookie = (await cookies()).get('ACCESS_TOKEN')?.value
      console.log('🍪 Cookie 值:', testCookie ? '存在' : '不存在')
      if (testCookie) {
        console.log('🍪 Cookie 長度:', testCookie.length)
      }
    }
    
    // 直接返回 JSON 響應，不覆蓋 cookie
    return res.json({ status: 'success', data: data.payload }, { status: 200 })
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
