// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
import { NextResponse as res } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import { getUserById, getFavoritesByUserId } from '@/services/user.service'

// 獲得Line登入網址
export async function GET() {
  // 從 cookie 中解密session
  const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
  const session = await decrypt(cookie)

  if (isDev) console.log('ACCESS_TOKEN', session)

  if (!session?.payload?.userId) {
    const error = { message: '授權失敗，沒有存取令牌' }
    return errorResponse(res, error)
  }

  // 取得使用者id，從session.payload.userId取得(透過JWT解碼)
  const userId = session?.payload?.userId

  try {
    // 取得會員所有資料，包含profile
    const data1 = await getUserById(userId)
    // 取得會員收藏清單
    const data2 = await getFavoritesByUserId(userId)
    return successResponse(res, {
      user: data1?.payload?.user,
      favorites: data2?.payload?.favorites,
    })
  } catch (error) {
    return errorResponse(res, error)
  }
}
