import { NextResponse as res } from 'next/server'

// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
// 導入服務層的類別
import { lineLoginGetAuthUrl } from '@/services/line-login.service'

// 獲得Line登入網址 GET 方法 /api/auth/line/login
export async function GET() {
  // 獲得Line Login的網址
  const data = await lineLoginGetAuthUrl()
  // 如果是開發環境
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
