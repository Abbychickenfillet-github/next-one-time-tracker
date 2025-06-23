// 導入必要的模組
import { NextResponse as res } from 'next/server'
import path from 'path'
import { writeFile } from 'fs/promises'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
// 導入服務層的類別
import { updateAvatarByUserId } from '@/services/user.service'

// 定義文件上傳的 POST 處理程序
export const POST = async (req) => {
  // 解析傳入的表單資料
  const formData = await req.formData()

  // 從表單資料中獲取文件(對照client上的formData.append('avatar', selectedFile))
  const file = formData.get('avatar')

  // 檢查是否接收到文件
  if (!file) {
    // 如果沒有接收到文件，返回一個包含錯誤訊息的 JSON 響應
    return errorResponse(res, { message: '沒有接收到文件' })
  }

  // 將文件資料轉換為 Buffer
  const buffer = Buffer.from(await file.arrayBuffer())

  // 從cookie中的ACCESS_TOKEN中取得會員ID
  const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
  const session = await decrypt(cookie)

  if (isDev) console.log('ACCESS_TOKEN', session)

  if (!session?.payload?.userId) {
    return errorResponse(res, { message: '授權失敗，沒有存取令牌' })
  }

  // 取得使用者id，從session.payload.userId取得(透過JWT解碼)
  const userId = session?.payload?.userId

  // 將文件名中的空格替換為下劃線
  const ext = file.name.split('.').pop()
  const filename = userId + '.' + ext

  if (isDev) console.log(filename)

  try {
    // 將文件寫入指定目錄 (public/avatar) 並使用修改後的文件名
    await writeFile(
      path.join(process.cwd(), 'public/avatar/' + filename),
      buffer
    )

    // 更新資料庫中會員資料中的頭像欄位
    const data = await updateAvatarByUserId(userId, filename)

    if (isDev) console.log(data)

    // API回應
    if (data?.status === 'success') {
      // 返回一個包含成功訊息和 201 狀態碼的 JSON 響應
      return successResponse(res)
    } else {
      const error = { message: data?.message }
      return errorResponse(res, error)
    }
  } catch (error) {
    // 如果在寫入文件時發生錯誤，記錄錯誤並返回一個包含失敗訊息JSON 響應
    console.log('上傳檔案發生錯誤 ', error)
    return errorResponse(res, error)
  }
}
