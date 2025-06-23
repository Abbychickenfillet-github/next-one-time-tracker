'use server' // 伺服器函式 Server Functions

// 導入next/cache模組
import { revalidatePath } from 'next/cache'
// 導入服務層的類別
import {
  // getBlogs,
  // getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from '@/services/blog.service'
import { isDev } from '@/lib/utils'

// eslint-disable-next-line no-unused-vars
export async function refresh(currentState, formData) {
  // 重新驗証資料: 通知next資料快取到期，重新獲取資料與重整快取，用於刷新RSC獲取的資料用，參數為RSC的路徑
  // https://nextjs.org/docs/app/api-reference/functions/revalidatePath
  revalidatePath('/rsc/blog')
}

export async function remove(currentState, formData) {
  // 由傳入的formData得到表單(客戶端元件)提交的資料(FormData物件)
  const blogId = Number(formData.get('blogId'))
  // 刪除部落格(註: 控制層會作驗證)
  const data = await deleteBlog(blogId)
  // 註: 重新取得部落格列表(在list元件中進行)

  // 除錯用
  isDev && console.log(data)
  // 回傳資料
  return data
}

export async function create(currentState, formData) {
  // 由傳入的formData得到表單(客戶端元件)提交的資料(FormData物件)
  const title = formData.get('title')
  const content = formData.get('content')
  // 新增部落格
  const data = await createBlog({ title, content })
  // 除錯用
  isDev && console.log(data)
  // 回傳資料
  return data
}

export async function update(currentState, formData) {
  // 由傳入的formData得到表單(客戶端元件)提交的資料(FormData物件)
  const title = formData.get('title')
  const content = formData.get('content')
  const blogId = Number(formData.get('blogId'))
  // 更新部落格
  const data = await updateBlog(blogId, { title, content })
  // 除錯用
  isDev && console.log(data)
  // 回傳資料
  return data
}
