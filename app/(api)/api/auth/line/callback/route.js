import { NextResponse as res } from 'next/server'

// 導入服務層的類別
import { lineLoginAuthCallback } from '@/services/line-login.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
import { createSession } from '@/lib/jwt-session'

// Line登入回調 GET 方法 /api/auth/line/callback
export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  const data = await lineLoginAuthCallback({ code, state })
  // 除錯用
  if (isDev) console.log(data)
  // API回應
  if (data?.status === 'success') {
    const payload = { userId: data?.payload?.user?.id }
    // 建立jwt session(Access Token) 並設定有效期限為3天
    await createSession(payload, '3d', 'ACCESS_TOKEN')
    // 成功回應
    return successResponse(res, data.payload)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
