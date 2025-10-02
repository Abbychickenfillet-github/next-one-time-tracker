import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request) {
  try {
    // 1. 檢查用戶是否已登入
    const cookieStore = cookies()
    const session = cookieStore.get('session')?.value

    if (!session) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const payload = await decrypt(session)
    if (!payload || !payload.userId) {
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
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 6. 上傳到 Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
          public_id: `user_${payload.userId}`,
          overwrite: true, // 覆蓋舊圖片
          resource_type: 'image',
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { format: 'webp', quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )

      streamifier.createReadStream(buffer).pipe(uploadStream)
    })

    // 7. 這裡可以更新資料庫中的用戶頭貼路徑
    // await updateUserAvatar(payload.userId, uploadResult.secure_url)

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
    const session = cookieStore.get('session')?.value

    if (!session) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const payload = await decrypt(session)
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    // 刪除 Cloudinary 中的圖片
    const { publicId } = await request.json()

    if (publicId) {
      await cloudinary.uploader.destroy(publicId)
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
