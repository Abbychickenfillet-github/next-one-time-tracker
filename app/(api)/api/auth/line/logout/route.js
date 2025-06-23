import { NextResponse as res } from 'next/server'

// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
// 導入服務層的類別
import { lineLoginLogout } from '@/services/line-login.service'
import { deleteSession, decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'

// 登出Line POST 方法 /api/auth/line/logout
export async function POST() {
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
  // 獲得Line Login的網址
  const data = await lineLoginLogout(userId)
  // 如果是開發環境
  if (isDev) console.log(data)

  // API回應
  if (data?.status === 'success') {
    // 清除jwt session(Access Token)，登出本地伺服端
    await deleteSession('ACCESS_TOKEN')
    // 成功回應
    return successResponse(res, data.payload)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
