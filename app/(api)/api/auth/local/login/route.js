import { NextResponse as res } from 'next/server'

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
    const payload = { userId: data?.payload?.user?.id }
    // 建立jwt session(Access Token) 並設定有效期限為3天
    await createSession(payload, '3d', 'ACCESS_TOKEN')
    // 回應成功
    return successResponse(res, data.payload)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
