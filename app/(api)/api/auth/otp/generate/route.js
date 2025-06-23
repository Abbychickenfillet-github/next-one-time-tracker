import { NextResponse as res } from 'next/server'

// 導入服務層
import { generateOtp } from '@/services/auth.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
// 導入寄送otp信件的函式
import { sendOtpMail } from '@/lib/mail.js'
// session
import { setSession } from '@/lib/iron-session'

export async function POST(request) {
  // 取得新增的資料
  const body = await request.json()
  // 如果是開發環境，顯示新增的資料
  if (isDev) console.log(body)
  // 建立OTP
  const data = await generateOtp(body)
  // 如果是開發環境，顯示OTP資料
  if (isDev) console.log(data)

  // API回應
  if (data.status === 'success') {
    const token = data?.payload?.otp?.token
    const hash = data?.payload?.otp?.hash
    const email = data?.payload?.otp?.email

    // 記錄hash到session，連回時，可以比對hash
    await setSession('OTP', 'secret', hash)

    // 寄送otp信件(注意這個操作會耗時)
    await sendOtpMail(email, token, hash)
    // 成功回應，不回傳otp資料
    return successResponse(res)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
