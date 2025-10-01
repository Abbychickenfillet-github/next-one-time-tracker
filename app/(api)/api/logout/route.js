import { NextResponse as res } from 'next/server'
import { decrypt, deleteSession } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import { successResponse, errorResponse } from '@/lib/utils'

/**
 * 登出 API 路由
 * 清除用戶的認證令牌和會話
 */
export async function POST() {
  try {
    // 獲取 ACCESS_TOKEN cookie
    const cookie = (await cookies()).get('ACCESS_TOKEN')?.value

    // 如果沒有 token，直接返回成功（用戶可能已經登出）
    if (!cookie) {
      return successResponse(res, { message: '用戶已登出' })
    }

    // 解密並驗證 token
    const session = await decrypt(cookie)

    // 如果 token 無效，清除 cookie 並返回成功
    if (!session?.payload?.userId) {
      await deleteSession('ACCESS_TOKEN')
      return successResponse(res, { message: '無效的認證令牌，已清除' })
    }

    // 清除認證令牌
    await deleteSession('ACCESS_TOKEN')

    // 記錄登出日誌（可選）
    console.log(`用戶 ${session.payload.userId} 已登出`)

    return successResponse(res, {
      message: '登出成功',
      userId: session.payload.userId,
    })
  } catch (error) {
    console.error('登出過程中發生錯誤:', error)

    // 即使發生錯誤，也嘗試清除 cookie
    try {
      await deleteSession('ACCESS_TOKEN')
    } catch (deleteError) {
      console.error('清除 cookie 時發生錯誤:', deleteError)
    }

    return errorResponse(
      res,
      {
        message: '登出過程中發生錯誤，但已清除認證令牌',
      },
      500
    )
  }
}

/**
 * 處理 OPTIONS 請求（CORS 預檢請求）
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
