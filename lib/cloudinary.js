import { v2 as cloudinary } from 'cloudinary'

// ========================================
// 🔧 Cloudinary 配置 (模組載入時立即執行)
// ========================================
// 這個配置會在 lib/cloudinary.js 被 import 時立即執行
// 執行順序：config → 函數定義 → 匯出
// 注意：這比 API 路由的執行更早，因為是模組載入階段
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * 上傳圖片到 Cloudinary
 * @param {Buffer} buffer - 圖片檔案緩衝區
 * @param {Object} options - 上傳選項
 * @param {string} options.folder - 資料夾名稱
 * @param {string} options.publicId - 公開ID
 * @param {boolean} options.overwrite - 是否覆蓋現有檔案
 * @param {Array} options.transformations - 圖片轉換設定
 * @returns {Promise<Object>} 上傳結果
 */
export async function uploadImage(buffer, options = {}) {
  const {
    folder = 'uploads',
    publicId,
    overwrite = true,
    transformations = [],
  } = options

  return new Promise((resolve, reject) => {
    // ========================================
    // 📤 建立上傳串流 (執行順序說明)
    // ========================================
    // 1. cloudinary.uploader.upload_stream() 建立上傳串流
    // 2. 設定上傳參數 (folder, public_id, overwrite, resource_type, transformation)
    // 3. 提供回調函數處理上傳結果
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder, // Cloudinary 資料夾名稱
        public_id: publicId, // 圖片唯一識別符
        overwrite, // 是否覆蓋同名圖片
        resource_type: 'image', // 資源類型：image/video/raw/auto
        transformation: transformations, // 圖片轉換設定陣列
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary 上傳錯誤:', error)
          reject(error)
        } else {
          console.log('Cloudinary 上傳成功:', result.public_id)
          resolve(result)
        }
      }
    )

    // ========================================
    // 🔄 Buffer 轉 Stream 並上傳
    // ========================================
    // streamifier.createReadStream(buffer) - 將 Buffer 轉為可讀串流
    // .pipe(uploadStream) - 將資料串流傳送到 Cloudinary
    // 這樣可以避免將整個檔案載入記憶體，提升效能
    const streamifier = require('streamifier')
    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

/**
 * 刪除 Cloudinary 中的圖片
 * @param {string} publicId - 圖片公開ID
 * @returns {Promise<Object>} 刪除結果
 *
 * ========================================
 * 🔍 Promise<Object> 詳細說明
 * ========================================
 * Promise<Object> 就是您平常知道的 Promise！
 * - Promise: 非同步操作的容器
 * - <Object>: TypeScript 泛型，表示 Promise 成功時回傳 Object 類型
 * - 等同於: Promise.resolve({...}) 或 new Promise((resolve) => resolve({...}))
 *
 * 使用方式：
 * const result = await deleteImage('image_id') // result 是 Object
 * 或
 * deleteImage('image_id').then(result => {}) // result 是 Object
 */
export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    console.log('Cloudinary 刪除結果:', result)
    return result
  } catch (error) {
    console.error('Cloudinary 刪除錯誤:', error)
    throw error
  }
}

/**
 * 生成 Cloudinary URL
 * @param {string} publicId - 圖片公開ID
 * @param {Array} transformations - 轉換設定
 * @returns {string} 圖片URL
 */
export function getCloudinaryUrl(publicId, transformations = []) {
  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true,
  })
}

/**
 * 預設的頭像轉換設定
 */
export const AVATAR_TRANSFORMATIONS = [
  { width: 200, height: 200, crop: 'fill', gravity: 'face' },
  { format: 'webp', quality: 'auto' },
]

/**
 * 預設的一般圖片轉換設定
 */
export const GENERAL_IMAGE_TRANSFORMATIONS = [
  { width: 800, height: 600, crop: 'limit' },
  { format: 'webp', quality: 'auto' },
]

export default cloudinary
