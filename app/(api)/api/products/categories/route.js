import { NextResponse as res } from 'next/server'

// 導入服務層的類別
import { getCategories } from '@/services/product.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

export async function GET() {
  // 取得部落格依照id
  const data = await getCategories()
  // 如果是開發環境，顯示部落格列表
  if (isDev) console.log(data)

  // API回應
  if (data.status === 'success') {
    return successResponse(res, data.payload)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
