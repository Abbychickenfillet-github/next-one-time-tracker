import { NextResponse as res } from 'next/server'

// 導入服務層的類別
import { getProductById } from '@/services/product.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

export async function GET(req, { params }) {
  // 需要轉換成數字
  const productId = Number((await params).productId)
  // 取得部落格依照id
  const data = await getProductById(productId)
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
