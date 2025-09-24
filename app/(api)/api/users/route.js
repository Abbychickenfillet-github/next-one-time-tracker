import { NextResponse as res } from 'next/server'

// 導入服務層的類別
import { createUser } from '@/services/user.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

// 註冊API: POST /api/users
export async function POST(request) {
  // 取得新增的資料
  const body = await request.json()
  // 如果是開發環境，顯示新增的資料
  if (isDev) console.log(body)
  // 進行登入(本地端)，驗證帳號密碼
  const data = await createUser(body)
  // 如果是開發環境，顯示部落格列表
  if (isDev) console.log(data)

  // API回應
  if (data?.status === 'success') {
    // 成功回應
    return successResponse(res, data.payload)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
