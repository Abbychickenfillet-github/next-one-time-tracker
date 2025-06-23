import { NextResponse as res } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
// 導入服務層的類別
import { addFavorite, deleteFavorite } from '@/services/user.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

export async function PUT(request, { params }) {
  // 需要轉換成數字
  const productId = Number((await params).productId)
  // 從 cookie 中解密session
  const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
  const session = await decrypt(cookie)

  console.log('ACCESS_TOKEN', session)

  if (!session?.payload?.userId) {
    const error = { message: '授權失敗，沒有存取令牌' }
    return errorResponse(res, error)
  }

  // 取得使用者id，從session.payload.userId取得(透過JWT解碼)
  const userId = session?.payload?.userId

  // 新增
  const data = await addFavorite({ userId, productId })
  // 如果是開發環境，顯示
  if (isDev) console.log(data)

  // API回應
  if (data.status === 'success') {
    return successResponse(res, null)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}

export async function DELETE(request, { params }) {
  // 需要轉換成數字
  const productId = Number((await params).productId)
  // 從 cookie 中解密session
  const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
  const session = await decrypt(cookie)

  console.log('ACCESS_TOKEN', session)

  if (!session?.payload?.userId) {
    const error = { message: '授權失敗，沒有存取令牌' }
    return errorResponse(res, error)
  }

  // 取得使用者id，從session.payload.userId取得(透過JWT解碼)
  const userId = session?.payload?.userId

  // 新增
  const data = await deleteFavorite({ userId, productId })
  // 如果是開發環境，顯示
  if (isDev) console.log(data)

  // API回應
  if (data.status === 'success') {
    return successResponse(res, null)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
