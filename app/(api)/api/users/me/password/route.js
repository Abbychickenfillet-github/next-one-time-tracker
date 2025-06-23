import { NextResponse as res } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'

// 導入服務層的類別
import { updateUserPasswordById } from '@/services/user.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

// 更新個人資料API: PUT /api/users/me/profile
export async function PUT(request) {
  // 取得新增的資料
  const body = await request.json()
  // 如果是開發環境，顯示新增的資料
  if (isDev) console.log(body)

  // 從cookie中的ACCESS_TOKEN中取得會員ID
  const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
  const session = await decrypt(cookie)

  console.log('ACCESS_TOKEN', session)

  if (!session?.payload?.userId) {
    const error = { message: '授權失敗，沒有存取令牌' }
    return errorResponse(res, error)
  }

  // 取得使用者id，從session.payload.userId取得(透過JWT解碼)
  const userId = session?.payload?.userId

  // 進行登入(本地端)，驗證帳號密碼
  const data = await updateUserPasswordById(userId, body)
  // 如果是開發環境，顯示部落格列表
  if (isDev) console.log(data)

  // API回應
  if (data?.status === 'success') {
    // 成功回應
    return successResponse(res)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
