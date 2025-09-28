import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
import { NextResponse as res } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import { getUserById, getFavoritesByUserId } from '@/services/user.service'

export async function GET() {
  try {
    const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
    const session = await decrypt(cookie)

    if (isDev) console.log('ACCESS_TOKEN', session)

    if (!session?.payload?.userId) {
      const error = { message: '授權失敗，沒有存取令牌' }
      return errorResponse(res, error)
    }

    const userId = session?.payload?.userId
    const data1 = await getUserById(userId)

    if (!data1?.payload?.user) {
      return errorResponse(res, { message: '找不到使用者或使用者已被停用' })
    }

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
