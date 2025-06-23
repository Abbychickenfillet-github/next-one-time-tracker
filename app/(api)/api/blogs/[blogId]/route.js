import { NextResponse as res } from 'next/server'

// 導入服務層的類別
import { getBlogById, updateBlog, deleteBlog } from '@/services/blog.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

export async function GET(req, { params }) {
  // 需要轉換成數字
  const blogId = Number((await params).blogId)
  // 取得部落格依照id
  const data = await getBlogById(blogId)
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

export async function PUT(req, { params }) {
  // 需要轉換成數字
  const blogId = Number((await params).blogId)
  // 取得資料
  const body = await req.json()
  // 更新部落格
  const data = await updateBlog(blogId, body)
  // 如果是開發環境，顯示部落格列表
  if (isDev) console.log(data)

  // API回應
  if (data.status === 'success') {
    return successResponse(res, null)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}

export async function DELETE(req, { params }) {
  // 需要轉換成數字
  const blogId = Number((await params).blogId)
  // 刪除部落格
  const data = await deleteBlog(blogId)
  // 如果是開發環境，顯示部落格列表
  if (isDev) console.log(data)

  // API回應
  if (data.status === 'success') {
    return successResponse(res, null)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
