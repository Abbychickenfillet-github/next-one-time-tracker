import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import {
  uploadImage,
  deleteImage,
  AVATAR_TRANSFORMATIONS,
} from '@/lib/cloudinary'
import { updateAvatarByUserId } from '@/services/user.service'

export async function POST(request) {
  try {
    // 1. 檢查用戶是否已登入
    const cookieStore = cookies()
    const session = cookieStore.get('ACCESS_TOKEN')?.value
    // session的定義由名稱session改為ACCESS_TOKEN就這樣而已
    if (!session) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const payload = await decrypt(session)
    if (!payload || !payload.payload?.userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    // 2. 解析請求
    const formData = await request.formData()
    const file = formData.get('avatar')

    if (!file) {
      return NextResponse.json({ error: '請選擇圖片檔案' }, { status: 400 })
    }

    // 3. 驗證檔案類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '僅支援 JPG、PNG、WebP 格式' },
        { status: 400 }
      )
    }

    // 4. 驗證檔案大小 (限制 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: '圖片大小不能超過 2MB' },
        { status: 400 }
      )
    }

    // 5. 轉換為 Buffer
    // ========================================
    // 🔍 ArrayBuffer 具體位置說明
    // ========================================
    // file.arrayBuffer() - 將 File 物件轉換為 ArrayBuffer (瀏覽器 API)
    // ArrayBuffer 是二進位資料的原始表示，類似於 C 語言的陣列
    // 這裡的 ArrayBuffer 就是 bytes 變數
    const bytes = await file.arrayBuffer() // ← ArrayBuffer 在這裡

    // Buffer.from(bytes) - 將 ArrayBuffer 轉換為 Node.js Buffer
    // Buffer 是 Node.js 中處理二進位資料的物件，提供更多操作方法
    // 兩者差異：
    // - ArrayBuffer: 瀏覽器標準，不可變，只能透過 TypedArray 操作
    // - Buffer: Node.js 專用，可變，提供更多便利方法 (如 .pipe(), .toString() 等)
    const buffer = Buffer.from(bytes) // ← 將 ArrayBuffer 轉為 Buffer

    // 6. 上傳到 Cloudinary
    // ========================================
    // 📁 資料夾設定說明
    // ========================================
    // folder: 'avatars' - 這是頭貼上傳的資料夾名稱
    // 位置：app/(api)/api/upload/avatar/route.js 第 69 行
    // 所有頭貼都會上傳到 Cloudinary 的 'avatars' 資料夾
    // 換密鑰不會影響資料夾，因為資料夾名稱是在程式碼中設定的
    const uploadResult = await uploadImage(buffer, {
      folder: 'avatars', // ← 資料夾名稱在這裡設定
      publicId: `user_${payload.payload.userId}`,
      overwrite: true,
      transformations: AVATAR_TRANSFORMATIONS,
    })

    // 7. 更新資料庫中的用戶頭貼路徑
    try {
      await updateAvatarByUserId(
        payload.payload.userId,
        uploadResult.secure_url
      )
    } catch (dbError) {
      console.error('更新資料庫頭貼失敗:', dbError)
      // 即使資料庫更新失敗，也回傳上傳成功的結果
    }

    // 8. 回傳結果
    return NextResponse.json({
      success: true,
      message: '頭貼上傳成功',
      avatarUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    })
  } catch (error) {
    console.error('頭貼上傳錯誤:', error)
    return NextResponse.json({ error: '上傳失敗，請稍後再試' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const cookieStore = cookies()
    const session = cookieStore.get('ACCESS_TOKEN')?.value

    if (!session) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const payload = await decrypt(session)
    if (!payload || !payload.payload?.userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    // 刪除 Cloudinary 中的圖片
    const { publicId } = await request.json()

    if (publicId) {
      await deleteImage(publicId)
    }

    return NextResponse.json({
      success: true,
      message: '頭貼刪除成功',
    })
  } catch (error) {
    console.error('頭貼刪除錯誤:', error)
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 })
  }
}
