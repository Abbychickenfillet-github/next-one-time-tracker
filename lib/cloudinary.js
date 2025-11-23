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
 * ========================================
 * 📦 uploadImage 函數說明
 * ========================================
 * 這是 Cloudinary 圖片上傳的核心函數
 *
 * 功能：
 * - 將 Buffer 轉換為 Stream 並上傳到 Cloudinary
 * - 支援自訂資料夾、公開ID、轉換設定等
 * - 使用 Promise 處理非同步上傳
 *
 * 使用範例：
 * const result = await uploadImage(buffer, {
 *   folder: 'avatars',
 *   publicId: 'user_123',
 *   overwrite: true,
 *   transformations: AVATAR_TRANSFORMATIONS
 * })
 *
 * @param {Buffer} buffer - 圖片檔案緩衝區
 * @param {Object} options - 上傳選項
 * @param {string} options.folder - 資料夾名稱 (預設: 'uploads')
 * @param {string} options.publicId - 公開ID (圖片唯一識別符)
 * @param {boolean} options.overwrite - 是否覆蓋現有檔案 (預設: true)
 * @param {Array} options.transformations - 圖片轉換設定陣列
 * @returns {Promise<Object>} 上傳結果，包含 secure_url, public_id 等
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
 * ========================================
 * 🔗 URL 生成說明
 * ========================================
 * 使用 Cloudinary SDK v2 內建的 cloudinary.url() 方法
 * 不需要額外安裝 @cloudinary/url-gen 套件
 *
 * url-gen 是 Cloudinary 的新一代 URL 生成 SDK，但對於現有使用場景，
 * Cloudinary SDK v2 的內建方法已經足夠使用
 *
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
 * ========================================
 * 📐 AVATAR_TRANSFORMATIONS 說明
 * ========================================
 * 用於頭貼圖片的轉換設定
 * - width: 200, height: 200 - 調整為 200x200 像素
 * - crop: 'fill' - 填滿整個區域
 * - gravity: 'face' - 自動偵測人臉並置中
 * - format: 'webp' - 轉換為 WebP 格式（更小的檔案大小）
 * - quality: 'auto' - 自動調整品質以平衡檔案大小和畫質
 */
export const AVATAR_TRANSFORMATIONS = [
  { width: 200, height: 200, crop: 'fill', gravity: 'face' },
  { format: 'webp', quality: 'auto' },
]

/**
 * 預設的一般圖片轉換設定
 * ========================================
 * 📐 GENERAL_IMAGE_TRANSFORMATIONS 說明
 * ========================================
 * 用於一般圖片的轉換設定
 * - width: 800, height: 600 - 限制最大尺寸為 800x600 像素
 * - crop: 'limit' - 保持原始比例，不裁切（與 'fill' 不同）
 * - format: 'webp' - 轉換為 WebP 格式
 * - quality: 'auto' - 自動調整品質
 *
 * 與 AVATAR_TRANSFORMATIONS 的差異：
 * - 頭貼：固定 200x200，會裁切以填滿
 * - 一般圖片：限制最大尺寸，保持比例不裁切
 */
export const GENERAL_IMAGE_TRANSFORMATIONS = [
  { width: 800, height: 600, crop: 'limit' },
  { format: 'webp', quality: 'auto' },
]

export default cloudinary
