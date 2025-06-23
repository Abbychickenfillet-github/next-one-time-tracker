import { NextResponse as res } from 'next/server'

// 導入回應函式
import { successResponse } from '@/lib/utils.js'
import { deleteSession } from '@/lib/jwt-session'

export async function POST() {
  // 清除jwt session(Access Token)，登出本地伺服端
  await deleteSession('ACCESS_TOKEN')
  // 成功回應
  return successResponse(res)
}
