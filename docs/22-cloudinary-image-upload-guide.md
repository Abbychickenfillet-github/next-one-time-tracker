# Cloudinary 圖片上傳功能說明

## 概述

本專案已整合 Cloudinary 圖片上傳服務，提供完整的圖片上傳、處理和管理功能。

## 環境變數設定

請確保在 `.env.development` 和 `.env.production` 中設定以下變數：

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 功能特色

### 1. 頭貼上傳 (`AvatarUpload` 組件)

- **路徑**: `/api/upload/avatar`
- **功能**: 專門用於用戶頭貼上傳
- **處理**: 自動調整為 200x200 像素，WebP 格式
- **限制**: 2MB 以下，支援 JPG/PNG/WebP

### 2. 一般圖片上傳 (`ImageUpload` 組件)

- **路徑**: `/api/upload/image`
- **功能**: 通用圖片上傳
- **處理**: 限制為 800x600 像素，WebP 格式
- **限制**: 5MB 以下，支援 JPG/PNG/WebP/GIF

### 3. Cloudinary 服務 (`lib/cloudinary.js`)

- 統一的圖片上傳/刪除介面
- 預設轉換設定
- 錯誤處理和日誌記錄

## 使用方法

### 在組件中使用頭貼上傳

```jsx
import AvatarUpload from '@/components/AvatarUpload'

function MyComponent() {
  const handleAvatarSuccess = (avatarUrl) => {
    console.log('頭貼上傳成功:', avatarUrl)
    // 更新 UI 或執行其他操作
  }

  return <AvatarUpload onUploadSuccess={handleAvatarSuccess} />
}
```

### 在組件中使用一般圖片上傳

```jsx
import ImageUpload from '@/components/ImageUpload'

function MyComponent() {
  const handleImageSuccess = (result) => {
    console.log('圖片上傳成功:', result.imageUrl)
    // 處理上傳結果
  }

  return (
    <ImageUpload
      onUploadSuccess={handleImageSuccess}
      folder="my-images"
      buttonText="選擇圖片"
      maxSize={3 * 1024 * 1024} // 3MB
    />
  )
}
```

## API 端點

### POST `/api/upload/avatar`

上傳用戶頭貼

**請求**:

- Content-Type: `multipart/form-data`
- Body: `avatar` (檔案)

**回應**:

```json
{
  "success": true,
  "message": "頭貼上傳成功",
  "avatarUrl": "https://res.cloudinary.com/...",
  "publicId": "avatars/user_123"
}
```

### POST `/api/upload/image`

上傳一般圖片

**請求**:

- Content-Type: `multipart/form-data`
- Body:
  - `image` (檔案)
  - `folder` (可選，預設 "general")
  - `transformations` (可選，JSON 字串)

**回應**:

```json
{
  "success": true,
  "message": "圖片上傳成功",
  "imageUrl": "https://res.cloudinary.com/...",
  "publicId": "general/user_123_1234567890",
  "width": 800,
  "height": 600,
  "format": "webp",
  "size": 45678
}
```

## 測試頁面

訪問 `/image-upload-test` 可以測試所有上傳功能：

- 頭貼上傳測試
- 一般圖片上傳測試
- 上傳結果展示
- 環境變數檢查

## 安全考量

1. **認證檢查**: 所有上傳都需要用戶登入
2. **檔案類型驗證**: 嚴格限制允許的檔案類型
3. **檔案大小限制**: 防止過大檔案上傳
4. **伺服器端驗證**: 所有驗證都在伺服器端執行

## 錯誤處理

- 前端組件會顯示具體的錯誤訊息
- 伺服器端會記錄詳細的錯誤日誌
- 支援網路錯誤和檔案格式錯誤的處理

## 注意事項

1. 確保 Cloudinary 帳戶有足夠的儲存空間
2. 定期清理不需要的圖片以節省成本
3. 在生產環境中設定適當的轉換和壓縮設定
4. 考慮使用 CDN 來提升圖片載入速度

