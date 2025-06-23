import { NextResponse as res } from 'next/server'

// 導入服務層的類別
import { resetPassword } from '@/services/auth.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

export async function POST(request) {
  // 取得新增的資料
  const body = await request.json()
  // 如果是開發環境，顯示新增的資料
  if (isDev) console.log(body)
  // 驗証OTP
  const data = await resetPassword(body)
  // 如果是開發環境，顯示OTP資料
  if (isDev) console.log(data)

  // API回應
  if (data.status === 'success') {
    return successResponse(res, data.payload)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
