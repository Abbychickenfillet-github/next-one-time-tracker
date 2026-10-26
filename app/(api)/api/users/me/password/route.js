import { NextResponse as res } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'

// 導入服務層的類別
import { updateUserPasswordById } from '@/services/user.service'
// 導入回應函式
import { successResponse, errorResponse } from '@/lib/utils.js'

// ========================================
// 🔐 更新用戶密碼 API: PUT /api/users/me/password
// ========================================
// 功能：允許已登入用戶更新自己的密碼
// 認證方式：透過 JWT Token 從 Cookie 中取得用戶身份
// 請求方式：PUT
// 請求體：{ "currentPassword": "舊密碼", "newPassword": "新密碼" }
export async function PUT(request) {
  // ========================================
  // 📥 1. 解析請求資料
  // ========================================
  // 從請求體中取得密碼更新資料
  const body = await request.json()

  // ========================================
  // 🍪 2. 從 Cookie 中取得 JWT Token
  // ========================================
  // 從瀏覽器 Cookie 中取得 ACCESS_TOKEN
  // 這個 Token 是在用戶登入時由後端設置的
  const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
  console.log('從 Cookie 取得的 ACCESS_TOKEN:', cookie ? '存在' : '不存在')

  // ========================================
  // 🔓 3. 解密 JWT Token 取得用戶資訊
  // ========================================
  // 使用 decrypt 函數解密 JWT Token
  // 解密後會得到包含用戶資訊的 session 物件
  const session = await decrypt(cookie)
  console.log('解密後的 session:', session ? '成功' : '失敗')

  // ========================================
  // ✅ 4. 驗證用戶身份
  // ========================================
  // 檢查 session 是否存在且包含有效的 userId
  // session?.payload?.userId 是從 JWT Token 中解析出的用戶 ID
  if (!session?.payload?.userId) {
    console.log('❌ 認證失敗：沒有有效的用戶 ID')
    const error = { message: '授權失敗，沒有存取令牌' }
    return errorResponse(res, error)
  }

  // ========================================
  // 🆔 5. 取得用戶 ID
  // ========================================
  // 從解密後的 session 中取得用戶 ID
  // 這個 ID 是在用戶登入時被編碼到 JWT Token 中的
  const userId = session?.payload?.userId
  console.log('取得用戶 ID:', userId)

  // ========================================
  // 🔄 6. 執行密碼更新
  // ========================================
  // 呼叫服務層函數更新用戶密碼
  // 服務層會驗證舊密碼是否正確，並將新密碼加密後存入資料庫
  const data = await updateUserPasswordById(userId, body)
  // 如果是開發環境，顯示更新結果

  // ========================================
  // 📤 7. 回傳 API 回應
  // ========================================
  // 根據服務層的回傳結果決定回應內容
  if (data?.status === 'success') {
    // 成功回應：密碼更新成功
    console.log('✅ 密碼更新成功')
    return successResponse(res)
  } else {
    // 失敗回應：回傳錯誤訊息
    console.log('❌ 密碼更新失敗:', data?.message)
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
