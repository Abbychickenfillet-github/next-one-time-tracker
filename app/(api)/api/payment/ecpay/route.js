// 說明：處理金流串接的路由
import { NextResponse } from 'next/server'
// 導入服務層的類別
import { getECPayParams } from '@/services/ecpay.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

export async function GET(request) {
  // 取得查詢參數，與設定預設值
  const searchParams = request.nextUrl.searchParams
  const amount = Number(searchParams.get('amount')) || 0
  const items = searchParams.get('items') || ''

  // 取得金流參數
  const data = getECPayParams(amount, items)

  // 如果是開發環境，顯示部落格列表
  if (isDev) console.log(data)

  // API回應
  if (data.status === 'success') {
    return successResponse(NextResponse, data?.payload)
  } else {
    const error = { message: data?.message }
    return errorResponse(NextResponse, error)
  }
}
