import { NextResponse as res } from 'next/server'

// 導入服務層的類別
import { getBlogs, createBlog } from '@/services/blog.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

export async function GET() {
  // 取得部落格列表
  const data = await getBlogs()
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

export async function POST(req) {
  // 取得新增的資料
  const body = await req.json()
  // 如果是開發環境，顯示新增的資料
  if (isDev) console.log(body)
  // 建立部落格
  const data = await createBlog(body)
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
