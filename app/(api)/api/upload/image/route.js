import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'
import { uploadImage, GENERAL_IMAGE_TRANSFORMATIONS } from '@/lib/cloudinary'

export async function POST(request) {
  try {
    // 1. 檢查用戶是否已登入
    const cookieStore = cookies()
    const session = cookieStore.get('ACCESS_TOKEN')?.value

    if (!session) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const payload = await decrypt(session)
    if (!payload || !payload.payload?.userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    // 2. 解析請求
    const formData = await request.formData()
    const file = formData.get('image')
    const folder = formData.get('folder') || 'general'
    const customTransformations = formData.get('transformations')

    if (!file) {
      return NextResponse.json({ error: '請選擇圖片檔案' }, { status: 400 })
    }

    // 3. 驗證檔案類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '僅支援 JPG、PNG、WebP、GIF 格式' },
        { status: 400 }
      )
    }

    // 4. 驗證檔案大小 (限制 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '圖片大小不能超過 5MB' },
        { status: 400 }
      )
    }

    // 5. 轉換為 Buffer
    // file.arrayBuffer() - 將 File 物件轉換為 ArrayBuffer (瀏覽器 API)
    // ArrayBuffer 是二進位資料的原始表示，類似於 C 語言的陣列
    const bytes = await file.arrayBuffer()

    // Buffer.from(bytes) - 將 ArrayBuffer 轉換為 Node.js Buffer
    // Buffer 是 Node.js 中處理二進位資料的物件，提供更多操作方法
    // 兩者差異：
    // - ArrayBuffer: 瀏覽器標準，不可變，只能透過 TypedArray 操作
    // - Buffer: Node.js 專用，可變，提供更多便利方法 (如 .pipe(), .toString() 等)
    const buffer = Buffer.from(bytes)

    // 6. 解析轉換設定
    let transformations = GENERAL_IMAGE_TRANSFORMATIONS
    if (customTransformations) {
      try {
        transformations = JSON.parse(customTransformations)
      } catch (error) {
        console.warn('無法解析自定義轉換設定，使用預設設定')
      }
    }

    // 7. 上傳到 Cloudinary
    const uploadResult = await uploadImage(buffer, {
      folder: folder,
      publicId: `${folder}_${payload.payload.userId}_${Date.now()}`,
      overwrite: false,
      transformations: transformations,
    })

    // 8. 回傳結果
    return NextResponse.json({
      success: true,
      message: '圖片上傳成功',
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      size: uploadResult.bytes,
    })
  } catch (error) {
    console.error('圖片上傳錯誤:', error)
    return NextResponse.json({ error: '上傳失敗，請稍後再試' }, { status: 500 })
  }
}
